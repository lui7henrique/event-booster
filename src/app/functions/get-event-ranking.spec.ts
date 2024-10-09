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
import { faker } from '@faker-js/faker'

let host: InferSelectModel<typeof schema.hosts>
let event: InferSelectModel<typeof schema.events>

const VALID_DATE = format(new Date(), 'MM/dd/yyyy')

describe('get event ranking', () => {
  beforeAll(async () => {
    host = await makeHost()
    event = await makeActiveEvent({ hostId: host.id })

    await Promise.all(
      Array.from({ length: 5 }).map(async (_, index) => {
        const subscription = await makeSubscription()
        const clickCount = faker.number.int({ min: 1, max: 10 })

        const referral = await makeReferralLink({
          email: subscription.email,
          eventId: event.id,
          token: `${index}`,
          clickCount: clickCount,
        })

        const referredSubscriptions = faker.number.int({
          min: 1,
          max: clickCount,
        })

        await Promise.all(
          Array.from({
            length: referredSubscriptions,
          }).map(
            async () =>
              await makeSubscription({
                referralId: referral.id,
                created_at: faker.date.between({
                  from: event.startDate,
                  to: event.endDate,
                }),
              })
          )
        )
      })
    )
  })

  it('should be able to return ranking', async () => {
    const sut = await getEventRanking({
      eventId: event.id,
      selectedDate: VALID_DATE,
    })

    expect(isRight(sut)).toBe(true)
  })

  it('should be able to return ranking ordered by subscription count', async () => {
    const sut = await getEventRanking({
      eventId: event.id,
      selectedDate: VALID_DATE,
    })

    expect(isRight(sut)).toBe(true)

    const subscriptionCounts = sut.right?.ranking.map(
      (item: { subscription_count: number }) => item.subscription_count
    )

    const isOrdered = subscriptionCounts.every(
      (value: number, index: number, array: number[]) => {
        return index === 0 || array[index - 1] >= value
      }
    )

    expect(isOrdered).toBe(true)
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
