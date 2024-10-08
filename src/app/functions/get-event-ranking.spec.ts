import { isLeft, isRight, unwrapEither } from '@/core/either'
import type { schema } from '@/db/schema'
import { makeActiveEvent, makeEvent } from '@/test/factories/make-event'
import { makeHost } from '@/test/factories/make-host'
import { makeReferralLink } from '@/test/factories/make-referral-link'
import { makeSubscription } from '@/test/factories/make-subscription'
import { addDays, format } from 'date-fns'
import type { InferSelectModel } from 'drizzle-orm'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { InvalidDateError } from '../errors/invalid-date'
import { InvalidFutureDateError } from '../errors/invalid-future-date'
import { getEventRanking } from './get-event-ranking'

let host: InferSelectModel<typeof schema.hosts>
let event: InferSelectModel<typeof schema.events>
let firstSubscription: InferSelectModel<typeof schema.subscriptions>
let firstReferral: InferSelectModel<typeof schema.referral>

const VALID_DATE = format(new Date(), 'MM/dd/yyyy')

describe('get event ranking', () => {
  beforeAll(async () => {
    host = await makeHost()
    event = await makeActiveEvent({ hostId: host.id })
    firstSubscription = await makeSubscription()
    firstReferral = await makeReferralLink({
      email: firstSubscription.email,
      eventId: event.id,
      token: '',
      clickCount: 10,
    })

    await Promise.all(
      Array.from({ length: 5 }).map(
        async () => await makeSubscription({ referralId: firstReferral.id })
      )
    )
  })

  it('should be able to return ranking', async () => {
    const sut = await getEventRanking({
      eventId: event.id,
      selectedDate: VALID_DATE,
    })

    expect(isRight(sut)).toBe(true)
  })

  it('should not be able to return ranking when selected_date is missing', async () => {
    const sut = await getEventRanking({
      eventId: event.id,
    })

    expect(isLeft(sut)).toBe(true)
    expect(unwrapEither(sut)).toBeInstanceOf(InvalidDateError)
  })

  it('should not be able to return ranking when selected_date is invalid', async () => {
    const sut = await getEventRanking({
      eventId: event.id,
      selectedDate: 'invalid',
    })

    expect(isLeft(sut)).toBe(true)
    expect(unwrapEither(sut)).toBeInstanceOf(InvalidDateError)
  })

  it('should not be able to return ranking when selected_date is in the future', async () => {
    const sut = await getEventRanking({
      eventId: event.id,
      selectedDate: format(addDays(new Date(), 1), 'MM/dd/yyyy'),
    })

    expect(isLeft(sut)).toBe(true)
    expect(unwrapEither(sut)).toBeInstanceOf(InvalidFutureDateError)
  })
})
