import { type NextRequest, NextResponse } from "next/server"

// In real implementation, use your preferred database
const eventsStore: any[] = []

export async function POST(request: NextRequest) {
  try {
    const eventData = await request.json()

    const event = {
      id: Date.now().toString(),
      ...eventData,
      timestamp: eventData.timestamp || new Date().toISOString(),
    }

    // In real implementation, save to your database
    // const savedEvent = await db.events.create({ data: event })

    eventsStore.unshift(event)

    return NextResponse.json(event)
  } catch (error) {
    return NextResponse.json({ error: "Failed to log event" }, { status: 500 })
  }
}

export async function GET() {
  try {
    // In real implementation, query your database
    // const events = await db.events.findMany({ orderBy: { timestamp: 'desc' } })

    return NextResponse.json(eventsStore)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 })
  }
}
