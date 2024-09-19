import { generateUniqueId } from '@/core/unique-id'
import { text, timestamp, boolean } from 'drizzle-orm/pg-core'
import { pgTable } from 'drizzle-orm/pg-core'

export const events = pgTable('events', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => generateUniqueId('event')),

  title: text('title').notNull(),
  start_date: timestamp('start_date').notNull(),
  end_date: timestamp('end_date').notNull(),
})
