import { generateUniqueId } from '@/core/unique-id'
import { text } from 'drizzle-orm/pg-core'
import { pgTable } from 'drizzle-orm/pg-core'
import { events } from './events'

export const referralLinks = pgTable('referral_links', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => generateUniqueId('referral-link')),
  email: text('email').notNull(),
  event_id: text('event_id').references(() => events.id),
  referral_link: text('referral_link').notNull(),
  token: text('token').notNull(),
})
