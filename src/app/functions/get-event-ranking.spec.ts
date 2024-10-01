import type { schema } from '@/db/schema'
import { makeEvent } from '@/test/factories/make-event'
import { makeHost } from '@/test/factories/make-host'
import { makeReferralLink } from '@/test/factories/make-referral-link'
import { makeSubscription } from '@/test/factories/make-subscription'
import type { InferSelectModel } from 'drizzle-orm'
import { beforeAll, describe, expect, it } from 'vitest'
import { getEventRanking } from './get-event-ranking'
import { isRight, unwrapEither } from '@/core/either'

let host: InferSelectModel<typeof schema.hosts>
let event: InferSelectModel<typeof schema.events>
let firstSubscription: InferSelectModel<typeof schema.subscriptions>
let firstReferral: InferSelectModel<typeof schema.referral>

describe('get event ranking', () => {
  beforeAll(async () => {
    host = await makeHost()
    event = await makeEvent({ host_id: host.id })
    firstSubscription = await makeSubscription()
    firstReferral = await makeReferralLink({
      email: firstSubscription.email,
      event_id: event.id,
      token: '',
    })
  })

  it('should be able to return ranking', async () => {
    const sut = await getEventRanking({
      event_id: event.id,
      selected_date: new Date().toISOString(),
    })

    console.log({ sut })

    expect(isRight(sut)).toBe(true)
    // expect(unwrapEither(sut)).toEqual({
    //   events: expect.arrayContaining([
    //     expect.objectContaining({
    //       host_id: host_id,
    //     }),
    //   ]),
    // })
  })
})
