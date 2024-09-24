import { makeLeft, makeRight } from '@/core/either'
import { db } from '@/db'
import { schema } from '@/db/schema'
import { EventInvalidDateError } from '../errors/event-invalid-date-error'
import { ServerError } from '../errors/server-error'
import { EventPastDateError } from '../errors/event-past-date-error'

type RegisterEventInput = {
  title: string
  start_date: string
  end_date: string
}

export async function registerEvent({
  title,
  start_date,
  end_date,
}: RegisterEventInput) {
  try {
    const isInvalidRangeDate =
      new Date(start_date).getTime() > new Date(end_date).getTime()

    if (isInvalidRangeDate) {
      return makeLeft(new EventInvalidDateError())
    }

    const isEventInPast = new Date(start_date).getTime() < new Date().getTime()

    if (isEventInPast) {
      return makeLeft(new EventPastDateError())
    }

    const [event] = await db
      .insert(schema.events)
      .values({
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        title,
      })
      .returning()

    return makeRight({ event })
  } catch (e) {
    console.log({ e })
    return makeLeft(new ServerError())
  }
}
