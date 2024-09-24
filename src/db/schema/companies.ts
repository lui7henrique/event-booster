import { generateUniqueId } from '@/core/unique-id'
import { text, timestamp, pgTable } from 'drizzle-orm/pg-core'
import { varchar } from 'drizzle-orm/pg-core'

export const companies = pgTable('companies', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => generateUniqueId('company')),
  name: text('name').notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password').notNull(),
  created_at: timestamp('created_at').defaultNow(),
})
