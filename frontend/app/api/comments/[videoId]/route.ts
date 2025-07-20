import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { videoId: string } }) {
  try {
    const { videoId } = params

    // In real implementation, call YouTube Data API v3
    // const response = await fetch(`https://www.googleapis.com/youtube/v3/commentThreads?part=snippet,replies&videoId=${videoId}&key=${process.env.YOUTUBE_API_KEY}`)

    const mockComments = [
      {
        id: "1",
        author: "John Doe",
        authorAvatar: "/placeholder.svg?height=32&width=32&text=JD",
        text: "Great tutorial! Really helped me understand the concepts.",
        publishedAt: "2024-01-16T14:20:00Z",
        likeCount: 5,
        replies: [],
      },
    ]

    return NextResponse.json(mockComments)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 })
  }
}
