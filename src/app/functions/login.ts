import { makeLeft, makeRight } from '@/core/either'
import { db } from '@/db'
import { schema } from '@/db/schema'
import { comparePassword } from '@/http/utils/password'
import { eq } from 'drizzle-orm'
import { InvalidEmailOrPassword } from '../errors/invalid-email-or-password'
import { ServerError } from '../errors/server-error'

type LoginCompanyInput = {
  email: string
  password: string
}

export async function loginCompany({ email, password }: LoginCompanyInput) {
  try {
    const [company] = await db
      .select()
      .from(schema.companies)
      .where(eq(schema.companies.email, email))
      .limit(1)

    if (!company) {
      return makeLeft(new InvalidEmailOrPassword())
    }

    const isPasswordValid = await comparePassword(password, company.password)

    if (!isPasswordValid) {
      return makeLeft(new InvalidEmailOrPassword())
    }

    return makeRight({ company })
  } catch {
    return makeLeft(new ServerError())
  }
}
