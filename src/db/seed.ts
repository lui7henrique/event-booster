import { addDays } from 'date-fns'
import { client, db } from '.'
import { schema } from './schema'
import { faker } from '@faker-js/faker'
import { hashPassword } from '@/http/utils/password'

async function main() {
  await db.delete(schema.referralLinks)
  await db.delete(schema.subscriptions)
  await db.delete(schema.events)
  await db.delete(schema.companies)

  const hashedPassword = await hashPassword('vercel-password')

  const [company] = await db
    .insert(schema.companies)
    .values({
      email: 'vercel@vercel.com',
      name: 'Vercel',
      password: hashedPassword,
    })
    .returning()

  const createEvent = () => ({
    title: faker.company.catchPhrase(),
    start_date: faker.date.past(),
    end_date: addDays(
      faker.date.future(),
      faker.number.int({ min: 1, max: 14 })
    ),
    company_id: company.id,
  })

  const events = Array.from({ length: 10 }).map(() => createEvent())

  await db.insert(schema.events).values(events)

  console.log('🌱 Database seeded with events!')
}

main()
  .catch(err => console.error(err))
  .finally(() => client.end())
