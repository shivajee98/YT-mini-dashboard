import { type NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const { videoId } = await params;  // ✅ Await params first, then destructure

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${process.env.YOUTUBE_API_KEY}`
    )
    const data = await response.json()
    const video = data.items?.[0]

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    const { snippet, statistics, contentDetails } = video

    const mappedVideo = {
      id: videoId,
      title: snippet.title,
      description: snippet.description,
      thumbnailUrl: snippet.thumbnails?.medium?.url || "/placeholder.svg",
      duration: contentDetails?.duration || "Unknown",
      viewCount: Number(statistics.viewCount),
      likeCount: Number(statistics.likeCount),
      commentCount: Number(statistics.commentCount),
      publishedAt: snippet.publishedAt,
      status: snippet.status || "unlisted",
    }

    return NextResponse.json(mappedVideo)
  } catch (error) {
    console.error("YouTube fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch video data" }, { status: 500 })
  }
}


export async function PUT(request: NextRequest, { params }: { params: { videoId: string } }) {
  try {
    const { videoId } = params
    const { title, description } = await request.json()

    // Log the event
    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "Video updated",
        details: `Title: ${title}, Description: ${description.substring(0, 50)}...`,
        timestamp: new Date().toISOString(),
      }),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update video" }, { status: 500 })
  }
}
