import { type NextRequest, NextResponse } from "next/server"

let notesStore: any[] = []

export async function GET(request: NextRequest, { params }: { params: { videoId: string } }) {
  try {
    const { videoId } = params

    const notes = notesStore.filter((note) => note.videoId === videoId)

    return NextResponse.json(notes)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { videoId: string } }) {
  try {
    const { videoId } = params
    const { content } = await request.json()

    const note = {
      id: Date.now().toString(),
      videoId,
      content,
      createdAt: new Date().toISOString(),
    }

    notesStore.push(note)

    // Log the event
    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "Note created",
        details: `"${content.substring(0, 50)}..."`,
        timestamp: new Date().toISOString(),
      }),
    })

    return NextResponse.json(note)
  } catch (error) {
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { videoId: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const noteId = searchParams.get("noteId")


    notesStore = notesStore.filter((note) => note.id !== noteId)

    // Log the event
    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "Note deleted",
        details: `Deleted note ${noteId}`,
        timestamp: new Date().toISOString(),
      }),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete note" }, { status: 500 })
  }
}
