import { makeLeft, makeRight } from '@/core/either'
import { db } from '@/db'
import { schema } from '@/db/schema'
import { comparePassword } from '@/http/utils/password'
import { eq } from 'drizzle-orm'

import { InvalidPasswordError } from '../errors/invalid-password-error'
import { InvalidEmailError } from '../errors/invalid-email-error'

type LoginInput = {
  email: string
  password: string
}

export async function login({ email, password }: LoginInput) {
  try {
    const [host] = await db
      .select()
      .from(schema.hosts)
      .where(eq(schema.hosts.email, email))

    if (!host) {
      return makeLeft(new InvalidEmailError())
    }

    const isPasswordValid = await comparePassword(password, host.password)

    if (!isPasswordValid) {
      return makeLeft(new InvalidPasswordError())
    }

    return makeRight({ host })
  } catch (error) {
    throw error
  }
}
