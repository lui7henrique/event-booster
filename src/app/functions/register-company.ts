import { makeLeft, makeRight } from '@/core/either'
import { db } from '@/db'
import { schema } from '@/db/schema'
import { PgIntegrityConstraintViolation } from '@/db/utils/postgres-errors'
import { hashPassword } from '@/http/utils/password'
import postgres from 'postgres'
import { CompanyAlreadyRegisteredError } from '../errors/company-already-registered'

type RegisterCompanyInput = {
  name: string
  email: string
  password: string
}

export async function registerCompany({
  name,
  email,
  password,
}: RegisterCompanyInput) {
  try {
    const hashedPassword = await hashPassword(password)

    const [_] = await db
      .insert(schema.companies)
      .values({
        name,
        email,
        password: hashedPassword,
      })
      .returning()

    const { password: _password, ...company } = _

    return makeRight({ company })
  } catch (err) {
    const isCompanyAlreadyRegistered =
      err instanceof postgres.PostgresError &&
      err.code === PgIntegrityConstraintViolation.UniqueViolation

    if (!isCompanyAlreadyRegistered) {
      throw err
    }

    return makeLeft(new CompanyAlreadyRegisteredError())
  }
}
