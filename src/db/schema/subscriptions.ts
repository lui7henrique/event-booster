import { generateUniqueId } from '@/core/unique-id'
import { text, timestamp } from 'drizzle-orm/pg-core'
import { pgTable } from 'drizzle-orm/pg-core'
import { events } from './events'
import { relations } from 'drizzle-orm'
import { referral } from './referral'

export const subscriptions = pgTable('subscriptions', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => generateUniqueId('user')),
  name: text('name').notNull(),
  email: text('email').notNull(),
  eventId: text('event_id').references(() => events.id),

  referralId: text('referral_id').references(() => referral.id),
  created_at: timestamp('created_at').notNull().defaultNow(),
})

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  referral_link: one(referral, {
    fields: [subscriptions.referralId],
    references: [referral.id],
  }),
}))
