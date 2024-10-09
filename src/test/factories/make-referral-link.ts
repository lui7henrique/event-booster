import { db } from '@/db'
import { schema } from '@/db/schema'
import { faker } from '@faker-js/faker'
import type { InferInsertModel } from 'drizzle-orm'

export function makeRawReferralLink(
  overrides: Partial<InferInsertModel<typeof schema.referral>> = {}
): InferInsertModel<typeof schema.referral> {
  return {
    email: faker.internet.email(),
    link: faker.internet.url(),
    token: 'token', // TODO: TROCAR
    ...overrides,
  }
}

export async function makeReferralLink(
  overrides: Partial<InferInsertModel<typeof schema.referral>>
) {
  const [referralLink] = await db
    .insert(schema.referral)
    .values(makeRawReferralLink(overrides))
    .returning()

  return referralLink
}
