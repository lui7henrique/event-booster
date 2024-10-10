import { makeLeft, makeRight } from '@/core/either'
import { db } from '@/db'
import { schema } from '@/db/schema'
import { EventInvalidDateError } from '../errors/event-invalid-date-error'
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
      throw new EventInvalidDateError()
    }

    const isEventInPast = startDate.getTime() < today.getTime()
    if (isEventInPast) {
      throw new EventPastDateError()
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
  } catch (error) {
    if (error instanceof EventInvalidDateError) {
      return makeLeft(new EventInvalidDateError())
    }

    if (error instanceof EventPastDateError) {
      return makeLeft(new EventPastDateError())
    }

    throw error
  }
}
