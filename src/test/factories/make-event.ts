import { generateUniqueId } from '@/core/unique-id'
import { db } from '@/db'
import { schema } from '@/db/schema'
import { fakerPT_BR as faker } from '@faker-js/faker'
import { addDays } from 'date-fns'
import type { InferInsertModel } from 'drizzle-orm'
import { makeHost } from './make-host'

type Event = InferInsertModel<typeof schema.events>
type Overrides = Partial<Event> & { host_id: string }

export function makeRawEvent(overrides: Overrides): Event {
  return {
    title: faker.commerce.productName(),
    start_date: addDays(new Date(), 1),
    end_date: addDays(new Date(), 3),
    ...overrides,
  }
}

export async function makeEvent(overrides: Overrides) {
  const [event] = await db
    .insert(schema.events)
    .values(makeRawEvent(overrides))
    .returning()

  return event
}
