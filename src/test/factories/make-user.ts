import { db } from '@/db'
import { schema } from '@/db/schema'
import { fakerPT_BR as faker } from '@faker-js/faker'
import type { InferInsertModel } from 'drizzle-orm'

export function makeRawUser(
  overrides: Partial<InferInsertModel<typeof schema.users>> = {}
): InferInsertModel<typeof schema.users> {
  return {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    ...overrides,
  }
}

export async function makeUser(
  overrides: Partial<InferInsertModel<typeof schema.users>> = {}
) {
  const [user] = await db
    .insert(schema.users)
    .values(makeRawUser(overrides))
    .returning()

  return user
}
