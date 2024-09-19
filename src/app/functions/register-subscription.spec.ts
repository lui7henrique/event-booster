import { makeEvent } from '@/test/factories/make-event'
import {
  makeRawSubscription,
  makeSubscription,
} from '@/test/factories/make-subscription'
import { describe, expect, it } from 'vitest'
import { registerSubscription } from './register-subscription'
import { isLeft, isRight, unwrapEither } from '@/core/either'
import { EmailAlreadySubscribedError } from '../errors/email-already-subscribed-error'

describe('register subscription', () => {
  it('should be able to make subscription', async () => {
    const event = await makeEvent()
    const { name, email } = makeRawSubscription()

    const sut = await registerSubscription({ name, email, eventId: event.id })

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

    const sut = await registerSubscription({ name, email, eventId: event.id })

    expect(isLeft(sut)).toBe(true)
    expect(unwrapEither(sut)).toBeInstanceOf(EmailAlreadySubscribedError)
  })
})
