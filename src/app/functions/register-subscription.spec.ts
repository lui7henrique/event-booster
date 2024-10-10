import { makeActiveEvent, makeEvent } from '@/test/factories/make-event'
import {
  makeRawSubscription,
  makeSubscription,
} from '@/test/factories/make-subscription'
import { beforeAll, describe, expect, it } from 'vitest'
import { registerSubscription } from './register-subscription'
import { isLeft, isRight, unwrapEither } from '@/core/either'
import { EmailAlreadySubscribedError } from '../errors/email-already-subscribed-error'
import { addDays } from 'date-fns'
import { EventDateError } from '../errors/event-date-error'
import { EventNotFoundError } from '../errors/event-not-found-error'
import { makeReferralLink } from '@/test/factories/make-referral-link'
import { makeHost } from '@/test/factories/make-host'
import type { InferSelectModel } from 'drizzle-orm'
import type { schema } from '@/db/schema'
import { faker } from '@faker-js/faker'

let host: InferSelectModel<typeof schema.hosts>
let activeEvent: InferSelectModel<typeof schema.events>

describe('register subscription', () => {
  beforeAll(async () => {
    host = await makeHost()
    activeEvent = await makeActiveEvent({ hostId: host.id })
  })

  it('should be able to register subscription', async () => {
    const { name, email } = makeRawSubscription()
    const sut = await registerSubscription({
      name,
      email,
      eventId: activeEvent.id,
    })

    expect(isRight(sut)).toBe(true)
    expect(unwrapEither(sut)).toEqual({
      subscription: expect.objectContaining({
        name,
      }),
    })
  })

  it('should not be able to register subscription twice', async () => {
    const { email, name } = await makeSubscription({
      eventId: activeEvent.id,
    })

    const sut = await registerSubscription({
      name,
      email,
      eventId: activeEvent.id,
    })

    expect(isLeft(sut)).toBe(true)
    expect(unwrapEither(sut)).toBeInstanceOf(EmailAlreadySubscribedError)
  })

  it('should not be able to register subscription out of the dates', async () => {
    const event = await makeEvent({
      startDate: addDays(new Date(), 10),
      endDate: addDays(new Date(), 15),
      hostId: host.id,
    })

    const { email, name } = makeRawSubscription({
      eventId: event.id,
    })

    const sut = await registerSubscription({ name, email, eventId: event.id })

    expect(isLeft(sut)).toBe(true)
    expect(unwrapEither(sut)).toBeInstanceOf(EventDateError)
  })

  it('should not be able to register subscription with invalid event', async () => {
    const { email, name } = makeRawSubscription()
    const sut = await registerSubscription({ name, email, eventId: 'invalid' })

    expect(isLeft(sut)).toBe(true)
    expect(unwrapEither(sut)).toBeInstanceOf(EventNotFoundError)
  })

  it('should be able to register subscription with a valid referral link token', async () => {
    const { name, email } = makeRawSubscription()
    const referralLink = await makeReferralLink({
      token: faker.string.uuid(),
      eventId: activeEvent.id,
    })

    const sut = await registerSubscription({
      name,
      email,
      eventId: activeEvent.id,
      referralToken: referralLink.token,
    })

    expect(isRight(sut)).toBe(true)
    expect(unwrapEither(sut)).toHaveProperty(
      'subscription.eventId',
      activeEvent.id
    )
  })
})
