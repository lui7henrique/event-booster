import { describe, expect, it } from 'vitest'
import { isRight, unwrapEither } from '@/core/either'
import { getEvents } from './get-events'
import { makeHost } from '@/test/factories/make-host'
import { makeEvent } from '@/test/factories/make-event'

const EVENTS_LENGTH = 3

describe('get events', () => {
  it('should be able to return host events', async () => {
    const host = await makeHost()

    await Promise.all(
      Array.from({ length: EVENTS_LENGTH }).map(
        async _ => await makeEvent({ hostId: host.id })
      )
    )

    const sut = await getEvents({ hostId: host.id })

    expect(isRight(sut))
    expect(unwrapEither(sut)).toEqual({
      events: expect.arrayContaining([
        expect.objectContaining({
          hostId: host.id,
        }),
      ]),
    })
  })
})
