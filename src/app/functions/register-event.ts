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

  const startDateIsAfterEndDate = startDate.getTime() > endDate.getTime()
  if (startDateIsAfterEndDate) {
    return makeLeft(new EventInvalidDateError())
  }

  const isEventInPast = startDate.getTime() < today.getTime()
  if (isEventInPast) {
    return makeLeft(new EventPastDateError())
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
}
