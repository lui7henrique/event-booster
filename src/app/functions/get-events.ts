import { db } from '@/db'
import { schema } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { ServerError } from '../errors/server-error'
import { makeLeft, makeRight } from '@/core/either'

type GetEventsInput = {
  company_id: string
}

export async function getEvents({ company_id }: GetEventsInput) {
  try {
    const events = await db
      .select()
      .from(schema.events)
      .where(eq(schema.events.company_id, company_id))

    return makeRight({ events })
  } catch {
    return makeLeft(new ServerError())
  }
}
