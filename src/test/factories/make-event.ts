import { db } from '@/db'
import { schema } from '@/db/schema'
import { fakerPT_BR as faker } from '@faker-js/faker'
import { addDays } from 'date-fns'
import type { InferInsertModel } from 'drizzle-orm'

export function makeRawEvent(
  overrides: Partial<InferInsertModel<typeof schema.events>> = {}
): InferInsertModel<typeof schema.events> {
  return {
    title: faker.commerce.productName(),
    start_date: new Date(),
    end_date: addDays(new Date(), 3),
    ...overrides,
  }
}

export async function makeEvent(
  overrides: Partial<InferInsertModel<typeof schema.events>> = {}
) {
  const [event] = await db
    .insert(schema.events)
    .values(makeRawEvent(overrides))
    .returning()

  return event
}
