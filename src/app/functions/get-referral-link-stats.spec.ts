import { describe, expect, it } from 'vitest'

import { isLeft, isRight, unwrapEither } from '@/core/either'
import { makeActiveEvent } from '@/test/factories/make-event'
import { makeReferralLink } from '@/test/factories/make-referral-link'
import { ReferralLinkNotFound } from '../errors/referral-link-not-found'
import { getReferralLinkStats } from './get-referral-link-stats'
import { makeHost } from '@/test/factories/make-host'

describe('get referral link stats', () => {
  it('returns an error if referral link is not found', async () => {
    const host = await makeHost()
    const event = await makeActiveEvent({ host_id: host.id })
    const token = 'nonexistent_token'

    const sut = await getReferralLinkStats({ token, event_id: event.id })

    expect(isLeft(sut)).toBe(true)
    expect(unwrapEither(sut)).toBeInstanceOf(ReferralLinkNotFound)
  })

  it('calculates direct conversion rate correctly', async () => {
    const host = await makeHost()
    const event = await makeActiveEvent({ host_id: host.id })

    const { token } = await makeReferralLink({
      event_id: event.id,
      click_count: 100,
      subscription_count: 20,
      token: 'token',
    })

    const sut = await getReferralLinkStats({ token, event_id: event.id })

    expect(isRight(sut)).toBe(true)
    expect(unwrapEither(sut)).toHaveProperty('directConversionRate', 20)
  })

  it('calculates indirect conversion rate correctly', async () => {
    const host = await makeHost()
    const event = await makeActiveEvent({ host_id: host.id })

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

    const sut = await getReferralLinkStats({
      token: childLink.token,
      event_id: event.id,
    })

    expect(isRight(sut)).toBe(true)
    expect(unwrapEither(sut)).toHaveProperty('indirectConversionRate', 20)
  })

  it('avoids division by zero in conversion rate calculations', async () => {
    const host = await makeHost()
    const event = await makeActiveEvent({ host_id: host.id })

    const { token } = await makeReferralLink({
      event_id: event.id,
      click_count: 0,
      subscription_count: 0,
      token: 'token',
    })

    const sut = await getReferralLinkStats({ token, event_id: event.id })

    expect(unwrapEither(sut)).toHaveProperty('directConversionRate', 0)

    expect(unwrapEither(sut)).toHaveProperty('indirectConversionRate', 0)
  })
})
