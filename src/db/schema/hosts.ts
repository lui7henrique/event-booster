import { generateUniqueId } from '@/core/unique-id'
import { text, timestamp, pgTable } from 'drizzle-orm/pg-core'
import { varchar } from 'drizzle-orm/pg-core'

export const hosts = pgTable('hosts', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => generateUniqueId('host')),
  name: text('name').notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})
