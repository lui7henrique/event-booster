import { db } from '@/db'
import { schema } from '@/db/schema'
import { faker } from '@faker-js/faker'
import type { InferInsertModel } from 'drizzle-orm'

export function makeRawReferralLink(
  overrides: Partial<InferInsertModel<typeof schema.referralLinks>> = {}
): InferInsertModel<typeof schema.referralLinks> {
  return {
    email: faker.internet.email(),
    referral_link: faker.internet.url(),
    ...overrides,
  }
}

export async function makeReferralLink(
  overrides: Partial<InferInsertModel<typeof schema.referralLinks>>
) {
  const [referralLink] = await db
    .insert(schema.referralLinks)
    .values(makeRawReferralLink(overrides))
    .returning()

  return referralLink
}
