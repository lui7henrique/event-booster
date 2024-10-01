import { generateUniqueId } from '@/core/unique-id'
import { relations } from 'drizzle-orm'
import { type AnyPgColumn, integer, text, timestamp } from 'drizzle-orm/pg-core'
import { pgTable } from 'drizzle-orm/pg-core'
import { events } from './events'
import { subscriptions } from './subscriptions'

export const referral = pgTable('referral_links', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => generateUniqueId('referral-link')),
  email: text('email').notNull(),
  event_id: text('event_id').references(() => events.id),
  referral_link: text('referral_link').notNull(),
  token: text('token').notNull(),

  click_count: integer('click_count').default(0).notNull(),
  subscription_count: integer('subscription_count').default(0).notNull(),

  parent_id: text('parent_id').references((): AnyPgColumn => referral.id),

  created_at: timestamp('created_at').notNull().defaultNow(),
})

export const referralLinksRelations = relations(referral, ({ many, one }) => ({
  subscriptions: many(subscriptions),
  parent_link: one(referral, {
    fields: [referral.parent_id],
    references: [referral.id],
  }),
}))
