import { beforeAll, describe, expect, it } from 'vitest'

import { isLeft, isRight, unwrapEither } from '@/core/either'
import type { schema } from '@/db/schema'
import { makeActiveEvent } from '@/test/factories/make-event'
import { makeHost } from '@/test/factories/make-host'
import { makeReferralLink } from '@/test/factories/make-referral-link'
import type { InferSelectModel } from 'drizzle-orm'
import { ReferralLinkNotFound } from '../errors/referral-link-not-found'
import { getReferralStats } from './get-referral-stats'

let host: InferSelectModel<typeof schema.hosts>
let event: InferSelectModel<typeof schema.events>

describe('get referral stats', () => {
  beforeAll(async () => {
    host = await makeHost()
    event = await makeActiveEvent({ hostId: host.id })
  })

  it('should not be able to return if referral link is not found', async () => {
    const token = 'nonexistent_token'
    const sut = await getReferralStats({ token, eventId: event.id })

    expect(isLeft(sut)).toBe(true)
    expect(unwrapEither(sut)).toBeInstanceOf(ReferralLinkNotFound)
  })

  it('should be able to calculates direct conversion rate correctly', async () => {
    const event = await makeActiveEvent({ hostId: host.id })

    const { token } = await makeReferralLink({
      eventId: event.id,
      clickCount: 100,
      subscriptionCount: 20,
      token: 'token',
    })

    const sut = await getReferralStats({ token, eventId: event.id })

    expect(isRight(sut)).toBe(true)
    expect(unwrapEither(sut)).toHaveProperty('directConversionRate', 20)
  })

  it('should be able to calculates indirect conversion rate correctly', async () => {
    const parentLink = await makeReferralLink({
      eventId: event.id,
      clickCount: 50,
      subscriptionCount: 10,
      token: 'token-1',
    })

    const childLink = await makeReferralLink({
      eventId: event.id,
      parentId: parentLink.id,
      clickCount: 150,
      subscriptionCount: 30,
      token: 'token-2',
    })

    const sut = await getReferralStats({
      token: childLink.token,
      eventId: event.id,
    })

    expect(isRight(sut)).toBe(true)
    expect(unwrapEither(sut)).toHaveProperty('indirectConversionRate', 20)
  })

  it('should be able to avoids division by zero in conversion rate calculations', async () => {
    const { token } = await makeReferralLink({
      eventId: event.id,
      clickCount: 0,
      subscriptionCount: 0,
      token: 'token',
    })

    const sut = await getReferralStats({ token, eventId: event.id })

    expect(unwrapEither(sut)).toHaveProperty('directConversionRate', 0)

    expect(unwrapEither(sut)).toHaveProperty('indirectConversionRate', 0)
  })
})
