import { makeLeft, makeRight } from '@/core/either'
import { db } from '@/db'
import { schema } from '@/db/schema'
import { comparePassword } from '@/http/utils/password'
import { eq } from 'drizzle-orm'
import { InvalidEmailOrPassword } from '../errors/invalid-email-or-password'
import { ServerError } from '../errors/server-error'

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
      .limit(1)

    if (!host) {
      return makeLeft(new InvalidEmailOrPassword())
    }

    const isPasswordValid = await comparePassword(password, host.password)

    if (!isPasswordValid) {
      return makeLeft(new InvalidEmailOrPassword())
    }

    return makeRight({ host })
  } catch {
    return makeLeft(new ServerError())
  }
}
