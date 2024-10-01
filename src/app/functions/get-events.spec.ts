import { describe, expect, it, vi } from 'vitest'
import { isLeft, isRight, unwrapEither } from '@/core/either'
import { getEvents } from './get-events'
import { makeHost } from '@/test/factories/make-host'
import { makeEvent } from '@/test/factories/make-event'
import { db } from '@/db'
import { ServerError } from '../errors/server-error'

const EVENTS_LENGTH = 3

describe('get events', () => {
  it('should be able to return host events', async () => {
    const { id: host_id } = await makeHost()

    await Promise.all(
      Array.from({ length: EVENTS_LENGTH }).map(
        async _ => await makeEvent({ host_id })
      )
    )

    const sut = await getEvents({ host_id })

    expect(isRight(sut))
    expect(unwrapEither(sut)).toEqual({
      events: expect.arrayContaining([
        expect.objectContaining({
          host_id: host_id,
        }),
      ]),
    })
  })

  it('should be able to return a ServerError when the database throws an error', async () => {
    vi.spyOn(db, 'select').mockImplementationOnce(() => {
      throw new Error('Database error')
    })

    const { id: host_id } = await makeHost()
    const sut = await getEvents({ host_id })

    expect(isLeft(sut)).toBe(true)
    expect(unwrapEither(sut)).toBeInstanceOf(ServerError)
  })
})
