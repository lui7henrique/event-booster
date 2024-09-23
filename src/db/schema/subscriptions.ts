import { generateUniqueId } from '@/core/unique-id'
import { text } from 'drizzle-orm/pg-core'
import { pgTable } from 'drizzle-orm/pg-core'
import { events } from './events'
import { referralLinks } from './referral-links'

export const subscriptions = pgTable('subscriptions', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => generateUniqueId('user')),
  name: text('name').notNull(),
  email: text('email').notNull(),
  event_id: text('event_id').references(() => events.id),

  referral_link_id: text('referral_link_id').references(() => referralLinks.id),
})
