import { db } from '@/db'
import { schema } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { makeLeft, makeRight } from '@/core/either'

type GetEventsInput = {
  hostId: string
}

export async function getEvents({ hostId }: GetEventsInput) {
  try {
    const events = await db
      .select()
      .from(schema.events)
      .where(eq(schema.events.hostId, hostId))

    return makeRight({ events })
  } catch (error) {
    throw error
  }
}
