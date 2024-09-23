import { describe, expect, it } from 'vitest'
import { handleReferralLinkStats } from './handle-referral-link-stats'

import { db } from '@/db'
import {
  isLeft,
  isRight,
  makeLeft,
  makeRight,
  unwrapEither,
} from '@/core/either'
import { ReferralLinkNotFound } from '../errors/referral-link-not-found'
import { makeEvent } from '@/test/factories/make-event'
import { makeReferralLink } from '@/test/factories/make-referral-link'
import { ServerError } from '../errors/server-error'

describe('handleReferralLinkStats', () => {
  it('returns an error if referral link is not found', async () => {
    const event = await makeEvent()
    const token = 'nonexistent_token'

    const sut = await handleReferralLinkStats({ token, event_id: event.id })

    expect(isLeft(sut)).toBe(true)
    expect(unwrapEither(sut)).toBeInstanceOf(ReferralLinkNotFound)
  })

  it('calculates direct conversion rate correctly', async () => {
    const event = await makeEvent()
    const { token } = await makeReferralLink({
      event_id: event.id,
      click_count: 100,
      subscription_count: 20,
      token: 'token',
    })

    const sut = await handleReferralLinkStats({ token, event_id: event.id })

    expect(isRight(sut)).toBe(true)
    expect(unwrapEither(sut)).toHaveProperty('directConversionRate', 20)
  })

  it('calculates indirect conversion rate correctly', async () => {
    const event = await makeEvent()

    const parentLink = await makeReferralLink({
      event_id: event.id,
      click_count: 50,
      subscription_count: 10,
      token: 'token-1',
    })

    const childLink = await makeReferralLink({
      event_id: event.id,
      parent_id: parentLink.id,
      click_count: 150,
      subscription_count: 30,
      token: 'token-2',
    })

    const sut = await handleReferralLinkStats({
      token: childLink.token,
      event_id: event.id,
    })

    expect(isRight(sut)).toBe(true)
    expect(unwrapEither(sut)).toHaveProperty('indirectConversionRate', 20)
  })

  it('avoids division by zero in conversion rate calculations', async () => {
    const event = await makeEvent()
    const { token } = await makeReferralLink({
      event_id: event.id,
      click_count: 0,
      subscription_count: 0,
      token: 'token',
    })

    const sut = await handleReferralLinkStats({ token, event_id: event.id })

    expect(unwrapEither(sut)).toHaveProperty('directConversionRate', 0)

    expect(unwrapEither(sut)).toHaveProperty('indirectConversionRate', 0)
  })
})
