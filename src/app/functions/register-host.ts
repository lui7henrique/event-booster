import { makeLeft, makeRight } from '@/core/either'
import { db } from '@/db'
import { schema } from '@/db/schema'
import { PgIntegrityConstraintViolation } from '@/db/utils/postgres-errors'
import { hashPassword } from '@/http/utils/password'
import postgres from 'postgres'
import { HashPasswordError } from '../errors/hash-password-error'
import { HostEmailAlreadyRegisteredError } from '../errors/host-email-already-registered'

type RegisterHostInput = {
  name: string
  email: string
  password: string
}

export async function registerHost({
  name,
  email,
  password,
}: RegisterHostInput) {
  let hashedPassword: string

  try {
    hashedPassword = await hashPassword(password)
  } catch {
    return makeLeft(new HashPasswordError())
  }

  try {
    const [host] = await db
      .insert(schema.hosts)
      .values({
        name,
        email,
        password: hashedPassword,
      })
      .returning()

    const { password: removedPassword, ...formattedHost } = host
    return makeRight({ host: formattedHost })
  } catch (error) {
    const isHostEmailAlreadyRegistered =
      error instanceof postgres.PostgresError &&
      error.code === PgIntegrityConstraintViolation.UniqueViolation

    if (isHostEmailAlreadyRegistered) {
      return makeLeft(new HostEmailAlreadyRegisteredError())
    }

    throw error
  }
}
