import { db } from '@/db'
import { schema } from '@/db/schema'
import { hashPassword } from '@/http/utils/password'
import { faker } from '@faker-js/faker'
import type { InferInsertModel } from 'drizzle-orm'

type Host = InferInsertModel<typeof schema.hosts>
type Overrides = Partial<Host>

export function makeRawHost(overrides: Overrides = {}): Host {
  return {
    email: faker.internet.email(),
    name: faker.person.fullName(),
    password: faker.internet.password(),
    ...overrides,
  }
}

export async function makeHost(overrides: Overrides = {}) {
  const [host] = await db
    .insert(schema.hosts)
    .values(makeRawHost(overrides))
    .returning()

  return host
}
