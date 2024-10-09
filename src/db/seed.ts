import { addDays } from 'date-fns'
import { client, db } from '.'
import { schema } from './schema'
import { faker } from '@faker-js/faker'
import { hashPassword } from '@/http/utils/password'

async function main() {
  await db.delete(schema.hosts)
  await db.delete(schema.referral)
  await db.delete(schema.subscriptions)
  await db.delete(schema.events)

  const hashedPassword = await hashPassword('vercel-password')

  const [host] = await db
    .insert(schema.hosts)
    .values({
      email: 'vercel@vercel.com',
      name: 'Vercel',
      password: hashedPassword,
    })
    .returning()

  const createEvent = () => ({
    title: faker.company.catchPhrase(),
    startDate: faker.date.past(),
    endDate: addDays(
      faker.date.future(),
      faker.number.int({ min: 1, max: 14 })
    ),
    hostId: host.id,
  })

  const events = Array.from({ length: 10 }).map(() => createEvent())

  await db.insert(schema.events).values(events)

  console.log('🌱 Database seeded with events!')
}

main()
  .catch(err => console.error(err))
  .finally(() => client.end())
