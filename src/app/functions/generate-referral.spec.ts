import { isLeft, isRight, unwrapEither } from '@/core/either'
import type { schema } from '@/db/schema'
import { makeActiveEvent } from '@/test/factories/make-event'
import { makeHost } from '@/test/factories/make-host'
import { makeReferralLink } from '@/test/factories/make-referral-link'
import { makeSubscription } from '@/test/factories/make-subscription'
import type { InferSelectModel } from 'drizzle-orm'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { ReferralLinkAlreadyExists } from '../errors/referral-link-already-exists'
import { generateReferral } from './generate-referral'

let host: InferSelectModel<typeof schema.hosts>
let event: InferSelectModel<typeof schema.events>
let subscription: InferSelectModel<typeof schema.subscriptions>

describe('generate referral', () => {
  beforeAll(async () => {
    host = await makeHost()
    event = await makeActiveEvent({ hostId: host.id })
    subscription = await makeSubscription({
      eventId: event.id,
    })
  })

  it('should be able to generate referral', async () => {
    const sut = await generateReferral({
      email: subscription.email,
      eventId: event.id,
    })

    expect(isRight(sut)).toBe(true)
    expect(unwrapEither(sut)).toEqual({
      referral: expect.objectContaining({
        email: subscription.email,
      }),
    })
  })

  it('should not be able to generate referral when its already exists', async () => {
    await makeReferralLink({
      eventId: event.id,
      email: subscription.email,
      token: '',
    })

    const sut = await generateReferral({
      email: subscription.email,
      eventId: event.id,
    })

    expect(isLeft(sut)).toBe(true)
    expect(unwrapEither(sut)).toBeInstanceOf(ReferralLinkAlreadyExists)
  })
})
