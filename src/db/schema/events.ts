import { generateUniqueId } from '@/core/unique-id'
import { text, timestamp, boolean } from 'drizzle-orm/pg-core'
import { pgTable } from 'drizzle-orm/pg-core'
import { hosts } from './hosts'

export const events = pgTable('events', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => generateUniqueId('event')),

  title: text('title').notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  hostId: text('host_id')
    .notNull()
    .references(() => hosts.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
})
