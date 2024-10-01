import { makeLeft, makeRight } from '@/core/either'
import { db } from '@/db'
import { schema } from '@/db/schema'
import { PgIntegrityConstraintViolation } from '@/db/utils/postgres-errors'
import { hashPassword } from '@/http/utils/password'
import postgres from 'postgres'
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
  try {
    const hashedPassword = await hashPassword(password)

    const [_] = await db
      .insert(schema.hosts)
      .values({
        name,
        email,
        password: hashedPassword,
      })
      .returning()

    const { password: _password, ...host } = _

    return makeRight({ host })
  } catch (err) {
    const isHostAlreadyRegistered =
      err instanceof postgres.PostgresError &&
      err.code === PgIntegrityConstraintViolation.UniqueViolation

    if (!isHostAlreadyRegistered) {
      throw err
    }

    return makeLeft(new HostEmailAlreadyRegisteredError())
  }
}
