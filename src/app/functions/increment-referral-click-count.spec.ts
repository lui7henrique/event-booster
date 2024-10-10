import { isLeft, isRight, unwrapEither } from '@/core/either'
import { makeActiveEvent, makeEvent } from '@/test/factories/make-event'
import { makeHost } from '@/test/factories/make-host'
import { makeReferralLink } from '@/test/factories/make-referral-link'
import { describe, expect, it } from 'vitest'
import { incrementReferralClickCount } from './increment-referral-click-count'
import { ReferralNotFound } from '../errors/referral-not-found'

describe('increment referral click count', () => {
  it('should be able to return an error if the referral link is not found', async () => {
    const sut = await incrementReferralClickCount({
      token: 'nonexistent_token',
      eventId: 'event123',
    })

    expect(isLeft(sut)).toBe(true)
    expect(unwrapEither(sut)).toBeInstanceOf(ReferralNotFound)
  })

  it('should be able to increment click count', async () => {
    const host = await makeHost()
    const event = await makeActiveEvent({ hostId: host.id })
    const { token } = await makeReferralLink({
      eventId: event.id,
      token: '',
    })

    const sut = await incrementReferralClickCount({
      token: token,
      eventId: event.id,
    })

    expect(isRight(sut)).toBe(true)
    expect(unwrapEither(sut)).toHaveProperty(
      'updatedReferralLink.clickCount',
      1
    )
  })
})
