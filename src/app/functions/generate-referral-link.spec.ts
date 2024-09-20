import { makeEvent } from '@/test/factories/make-event'
import { makeSubscription } from '@/test/factories/make-subscription'
import { describe, expect, it } from 'vitest'
import { registerSubscription } from './register-subscription'
import { isRight, unwrapEither } from '@/core/either'
import { generateReferralLink } from './generate-referral-link'

describe('generate referral link', () => {
  it('should be able to generate referral link', async () => {
    const event = await makeEvent()

    const { name, email } = await makeSubscription({
      event_id: event.id,
    })

    const sut = await generateReferralLink({ email, event_id: event.id })

    expect(isRight(sut)).toBe(true)

    expect(unwrapEither(sut)).toEqual({
      referralLink: expect.objectContaining({
        email,
      }),
    })
  })

  it('should not be able to generate referral link when its already exists', async () => {
    const event = await makeEvent()
    const { name, email } = await makeSubscription({
      event_id: event.id,
    })

    const sut = await generateReferralLink({ email, event_id: event.id })

    expect(isRight(sut)).toBe(true)

    expect(unwrapEither(sut)).toEqual({
      referralLink: expect.objectContaining({
        email,
      }),
    })
  })
})
