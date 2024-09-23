import { makeEvent } from '@/test/factories/make-event'
import {
  makeRawSubscription,
  makeSubscription,
} from '@/test/factories/make-subscription'
import { describe, expect, it } from 'vitest'
import { registerSubscription } from './register-subscription'
import { isLeft, isRight, unwrapEither } from '@/core/either'
import { EmailAlreadySubscribedError } from '../errors/email-already-subscribed-error'
import { addDays } from 'date-fns'
import { EventDateError } from '../errors/event-date-error'
import { EventNotFoundError } from '../errors/event-not-found-error'
import { makeReferralLink } from '@/test/factories/make-referral-link'

describe('register subscription', () => {
  it('should be able to make subscription', async () => {
    const event = await makeEvent()
    const { name, email } = makeRawSubscription()

    const sut = await registerSubscription({ name, email, event_id: event.id })

    expect(isRight(sut)).toBe(true)

    expect(unwrapEither(sut)).toEqual({
      subscription: expect.objectContaining({
        name,
      }),
    })
  })

  it('should not be able to make subscription twice', async () => {
    const event = await makeEvent()

    const { email, name } = await makeSubscription({
      event_id: event.id,
    })

    const sut = await registerSubscription({ name, email, event_id: event.id })

    expect(isLeft(sut)).toBe(true)
    expect(unwrapEither(sut)).toBeInstanceOf(EmailAlreadySubscribedError)
  })

  it('should not be able to make subscription out of the dates', async () => {
    const event = await makeEvent({
      start_date: addDays(new Date(), 10),
      end_date: addDays(new Date(), 15),
    })

    const { email, name } = makeRawSubscription({
      event_id: event.id,
    })

    const sut = await registerSubscription({ name, email, event_id: event.id })

    expect(isLeft(sut)).toBe(true)
    expect(unwrapEither(sut)).toBeInstanceOf(EventDateError)
  })

  it('should not be able to make subscription with invalid event', async () => {
    const { email, name } = makeRawSubscription()
    const sut = await registerSubscription({ name, email, event_id: 'invalid' })

    expect(isLeft(sut)).toBe(true)
    expect(unwrapEither(sut)).toBeInstanceOf(EventNotFoundError)
  })

  it('should be able to make subscription with a valid referral link token', async () => {
    const event = await makeEvent()
    const { name, email } = makeRawSubscription()

    const referralLink = await makeReferralLink({
      token: 'valid-token',
      event_id: event.id,
    })

    const sut = await registerSubscription({
      name,
      email,
      event_id: event.id,
      referral_link_token: referralLink.token,
    })

    expect(isRight(sut)).toBe(true)
    expect(unwrapEither(sut)).toHaveProperty('subscription.event_id', event.id)
  })
})
