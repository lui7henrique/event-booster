import { isLeft, isRight, unwrapEither } from '@/core/either'
import { makeHost, makeRawHost } from '@/test/factories/make-host'
import { describe, expect, it } from 'vitest'

import { hashPassword } from '@/http/utils/password'
import { faker } from '@faker-js/faker'
import { InvalidEmailError } from '../errors/invalid-email-error'
import { InvalidPasswordError } from '../errors/invalid-password-error'
import { login } from './login'

describe('login', () => {
  it('should be able to login', async () => {
    const password = faker.internet.password()
    const hashedPassword = await hashPassword(password)

    const host = await makeHost({ password: hashedPassword })
    const sut = await login({ email: host.email, password })

    expect(isRight(sut)).toBe(true)
    expect(unwrapEither(sut)).toEqual({
      host: expect.objectContaining({
        email: host.email,
      }),
    })
  })

  it('should not be able to login with non-existent host', async () => {
    const host = makeRawHost()
    const sut = await login({ email: host.email, password: host.password })

    expect(isLeft(sut)).toBe(true)
    expect(unwrapEither(sut)).toBeInstanceOf(InvalidEmailError)
  })

  it('should not be able to login with invalid credentials', async () => {
    const host = await makeHost()
    const sut = await login({ email: host.email, password: host.password })

    expect(isLeft(sut)).toBe(true)
    expect(unwrapEither(sut)).toBeInstanceOf(InvalidPasswordError)
  })
})
