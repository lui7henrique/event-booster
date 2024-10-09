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
  eventId: text('event_id').references(() => events.id),
  link: text('link').notNull(),
  token: text('token').notNull().unique(),
  clickCount: integer('click_count').default(0).notNull(),
  subscriptionCount: integer('subscription_count').default(0).notNull(),
  parentId: text('parent_id').references((): AnyPgColumn => referral.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const referralLinksRelations = relations(referral, ({ many, one }) => ({
  subscriptions: many(subscriptions),
  parent_link: one(referral, {
    fields: [referral.parentId],
    references: [referral.id],
  }),
}))
