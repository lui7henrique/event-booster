import { makeRawEvent } from '@/test/factories/make-event'
import { describe, expect, it } from 'vitest'
import { registerEvent } from './register-event'
import { isLeft, isRight, unwrapEither } from '@/core/either'
import { makeHost } from '@/test/factories/make-host'
import { addDays, subDays } from 'date-fns'
import { EventInvalidDateError } from '../errors/event-invalid-date-error'
import { EventPastDateError } from '../errors/event-past-date-error'

describe('register event', () => {
  it('should be able to register an event', async () => {
    const host = await makeHost()
    const event = makeRawEvent({ host_id: host.id })

    const sut = await registerEvent({
      ...event,
      end_date: event.end_date.toISOString(),
      start_date: event.start_date.toISOString(),
    })

    expect(isRight(sut)).toBe(true)
    expect(unwrapEither(sut)).toEqual({
      event: expect.objectContaining({
        title: event.title,
      }),
    })
  })

  it('should not be able to register with invalid range date', async () => {
    const host = await makeHost()

    const event = makeRawEvent({
      host_id: host.id,

      // start date > end date
      start_date: addDays(new Date(), 2),
      end_date: addDays(new Date(), 1),
    })

    const sut = await registerEvent({
      ...event,
      end_date: event.end_date.toISOString(),
      start_date: event.start_date.toISOString(),
    })

    expect(isLeft(sut)).toBe(true)
    expect(unwrapEither(sut)).toBeInstanceOf(EventInvalidDateError)
  })

  it('should not be able to register with past date', async () => {
    const host = await makeHost()

    const pastDate = subDays(new Date(), 1)
    const event = makeRawEvent({
      host_id: host.id,
      start_date: pastDate,
    })

    const sut = await registerEvent({
      ...event,
      end_date: event.end_date.toISOString(),
      start_date: event.start_date.toISOString(),
    })

    expect(isLeft(sut)).toBe(true)
    expect(unwrapEither(sut)).toBeInstanceOf(EventPastDateError)
  })
})
