import { describe, expect, it } from 'vitest'
import { isLeft, isRight, unwrapEither } from '@/core/either'
import { ReferralLinkNotFound } from '../errors/referral-link-not-found'
import { incrementReferralLinkCount } from './increment-referral-link-click-count'
import { makeReferralLink } from '@/test/factories/make-referral-link'
import { makeActiveEvent, makeEvent } from '@/test/factories/make-event'
import { makeHost } from '@/test/factories/make-host'

describe('increment referral link click count', () => {
  it('should be able to return an error if the referral link is not found', async () => {
    const sut = await incrementReferralLinkCount({
      token: 'nonexistent_token',
      event_id: 'event123',
    })

    expect(isLeft(sut)).toBe(true)
    expect(unwrapEither(sut)).toBeInstanceOf(ReferralLinkNotFound)
  })

  it('should be able to increment click count', async () => {
    const host = await makeHost()
    const event = await makeActiveEvent({ host_id: host.id })

    const { token } = await makeReferralLink({
      event_id: event.id,
      token: '',
    })

    const sut = await incrementReferralLinkCount({
      token: token,
      event_id: event.id,
    })

    expect(isRight(sut)).toBe(true)
    expect(unwrapEither(sut)).toHaveProperty(
      'updatedReferralLink.click_count',
      1
    )
  })
})
