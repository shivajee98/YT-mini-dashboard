import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { videoId, text, parentId } = await request.json()

    // In real implementation, call YouTube Data API v3
    // const response = await fetch(`https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&key=${process.env.YOUTUBE_API_KEY}`, {
    //   method: 'POST',
    //   headers: { 'Authorization': `Bearer ${accessToken}` },
    //   body: JSON.stringify({
    //     snippet: {
    //       videoId,
    //       topLevelComment: { snippet: { textOriginal: text } }
    //     }
    //   })
    // })

    // Log the event
    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: parentId ? "Reply added" : "Comment added",
        details: `"${text.substring(0, 50)}..."`,
        timestamp: new Date().toISOString(),
      }),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to add comment" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const commentId = searchParams.get("commentId")

    // In real implementation, call YouTube Data API v3
    // const response = await fetch(`https://www.googleapis.com/youtube/v3/comments?id=${commentId}&key=${process.env.YOUTUBE_API_KEY}`, {
    //   method: 'DELETE',
    //   headers: { 'Authorization': `Bearer ${accessToken}` }
    // })

    // Log the event
    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "Comment deleted",
        details: `Deleted comment ${commentId}`,
        timestamp: new Date().toISOString(),
      }),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 })
  }
}
