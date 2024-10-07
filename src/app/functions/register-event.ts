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
  host_id: string
}

export async function registerEvent({
  title,
  start_date,
  end_date,
  host_id,
}: RegisterEventInput) {
  try {
    const startDateIsAfterEndDate =
      new Date(start_date).getTime() > new Date(end_date).getTime()

    if (startDateIsAfterEndDate) {
      return makeLeft(
        new EventInvalidDateError('Start date cannot be after end date.')
      )
    }

    const isEventInPast = new Date(start_date).getTime() < new Date().getTime()

    if (isEventInPast) {
      return makeLeft(
        new EventPastDateError('Event start date is in the past.')
      )
    }

    const [event] = await db
      .insert(schema.events)
      .values({
        title,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        host_id,
      })
      .returning()

    return makeRight({ event })
  } catch (e) {
    return makeLeft(
      new ServerError('Failed to register the event due to a server error.')
    )
  }
}
