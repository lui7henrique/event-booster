import { db } from '@/db'
import { schema } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { ServerError } from '../errors/server-error'
import { makeLeft, makeRight } from '@/core/either'

type GetEventsInput = {
  host_id: string
}

export async function getEvents({ host_id }: GetEventsInput) {
  try {
    const events = await db
      .select()
      .from(schema.events)
      .where(eq(schema.events.host_id, host_id))

    return makeRight({ events })
  } catch {
    return makeLeft(new ServerError())
  }
}
