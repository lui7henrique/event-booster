import { makeLeft, makeRight } from '@/core/either'
import { db } from '@/db'
import { schema } from '@/db/schema'
import { hashPassword } from '@/http/utils/password'
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
  } catch (err) {
    return makeLeft(new HostEmailAlreadyRegisteredError())
  }
}
