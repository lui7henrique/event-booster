import { describe, expect, it } from 'vitest'
import { isRight, unwrapEither } from '@/core/either'
import { makeHost, makeRawHost } from '@/test/factories/make-host'
import { registerHost } from './register-host'
import { HostEmailAlreadyRegisteredError } from '../errors/host-email-already-registered'

describe('register host', () => {
  it('should be able to register a host', async () => {
    const host = makeRawHost()
    const sut = await registerHost(host)

    expect(isRight(sut)).toBe(true)
    expect(unwrapEither(sut)).toEqual({
      host: expect.objectContaining({
        email: host.email,
      }),
    })
  })

  it('should not be able to register a host with e-mail already registered', async () => {
    const host = await makeHost()
    const sut = await registerHost(host)

    expect(isRight(sut)).toBe(false)
    expect(unwrapEither(sut)).toBeInstanceOf(HostEmailAlreadyRegisteredError)
  })
})
