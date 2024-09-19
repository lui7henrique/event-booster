import { db } from '@/db'
import { schema } from '@/db/schema'
import { fakerPT_BR as faker } from '@faker-js/faker'
import type { InferInsertModel } from 'drizzle-orm'

export function makeRawSubscription(
  overrides: Partial<InferInsertModel<typeof schema.subscriptions>> = {}
): InferInsertModel<typeof schema.subscriptions> {
  return {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    ...overrides,
  }
}

export async function makeSubscription(
  overrides: Partial<InferInsertModel<typeof schema.subscriptions>> = {}
) {
  const [subscription] = await db
    .insert(schema.subscriptions)
    .values(makeRawSubscription(overrides))
    .returning()

  return subscription
}
