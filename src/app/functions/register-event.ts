import { makeLeft, makeRight } from '@/core/either'
import { db } from '@/db'
import { schema } from '@/db/schema'
import { EventInvalidDateError } from '../errors/event-invalid-date-error'
import { ServerError } from '../errors/server-error'
import { EventPastDateError } from '../errors/event-past-date-error'

type RegisterEventInput = {
  title: string
  startDate: Date
  endDate: Date
  hostId: string
}

export async function registerEvent({
  title,
  startDate,
  endDate,
  hostId,
}: RegisterEventInput) {
  const today = new Date()

  try {
    const startDateIsAfterEndDate = startDate.getTime() > endDate.getTime()

    if (startDateIsAfterEndDate) {
      return makeLeft(
        new EventInvalidDateError('Start date cannot be after end date.')
      )
    }

    const isEventInPast = startDate.getTime() < today.getTime()

    if (isEventInPast) {
      return makeLeft(
        new EventPastDateError('Event start date is in the past.')
      )
    }

    const [event] = await db
      .insert(schema.events)
      .values({
        title,
        startDate,
        endDate,
        hostId,
      })
      .returning()

    return makeRight({ event })
  } catch (e) {
    return makeLeft(
      new ServerError('Failed to register the event due to a server error.')
    )
  }
}
