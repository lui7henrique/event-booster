import { describe, expect, it, beforeAll, vi } from 'vitest'
import {
  isLeft,
  isRight,
  makeLeft,
  makeRight,
  unwrapEither,
} from '@/core/either'
import { ReferralLinkNotFound } from '../errors/referral-link-not-found'
import { handleReferralLink } from './handle-referral-link'
import { makeReferralLink } from '@/test/factories/make-referral-link'
import { makeEvent } from '@/test/factories/make-event'

describe('handleReferralLink', () => {
  it('should be able to return an error if the referral link is not found', async () => {
    const sut = await handleReferralLink({
      token: 'nonexistent_token',
      event_id: 'event123',
    })

    expect(isLeft(sut)).toBe(true)
    expect(unwrapEither(sut)).toBeInstanceOf(ReferralLinkNotFound)
  })

  it('should be to increment click count and return updated referral link', async () => {
    const event = await makeEvent()

    const { token } = await makeReferralLink({
      event_id: event.id,
      token: '',
    })

    const sut = await handleReferralLink({
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
