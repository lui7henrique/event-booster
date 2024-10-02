import { isLeft, isRight, unwrapEither } from '@/core/either'
import type { schema } from '@/db/schema'
import { makeActiveEvent } from '@/test/factories/make-event'
import { makeHost } from '@/test/factories/make-host'
import { makeReferralLink } from '@/test/factories/make-referral-link'
import { makeSubscription } from '@/test/factories/make-subscription'
import type { InferSelectModel } from 'drizzle-orm'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { ReferralLinkAlreadyExists } from '../errors/referral-link-already-exists'
import { generateReferralLink } from './generate-referral-link'
import { db } from '@/db'
import { ServerError } from '../errors/server-error'

let host: InferSelectModel<typeof schema.hosts>
let event: InferSelectModel<typeof schema.events>
let subscription: InferSelectModel<typeof schema.subscriptions>

describe('generate referral link', () => {
  beforeAll(async () => {
    host = await makeHost()
    event = await makeActiveEvent({ host_id: host.id })
    subscription = await makeSubscription({
      event_id: event.id,
    })
  })

  it('should be able to generate referral link', async () => {
    const sut = await generateReferralLink({
      email: subscription.email,
      event_id: event.id,
    })

    expect(isRight(sut)).toBe(true)
    expect(unwrapEither(sut)).toEqual({
      referralLink: expect.objectContaining({
        email: subscription.email,
      }),
    })
  })

  it('should not be able to generate referral link when its already exists', async () => {
    await makeReferralLink({
      event_id: event.id,
      email: subscription.email,
      token: '',
    })

    const sut = await generateReferralLink({
      email: subscription.email,
      event_id: event.id,
    })

    expect(isLeft(sut)).toBe(true)
    expect(unwrapEither(sut)).toBeInstanceOf(ReferralLinkAlreadyExists)
  })

  it('should be able to return a ServerError when the database throws an error', async () => {
    vi.spyOn(db, 'select').mockImplementationOnce(() => {
      throw new Error('Database error')
    })

    const sut = await generateReferralLink({
      email: subscription.email,
      event_id: event.id,
    })

    expect(isLeft(sut)).toBe(true)
    expect(unwrapEither(sut)).toBeInstanceOf(ServerError)
  })
})
