import { addDays } from 'date-fns'
import { client, db } from '.'
import { schema } from './schema'
import { faker } from '@faker-js/faker'

async function main() {
  await db.delete(schema.referralLinks)
  await db.delete(schema.subscriptions)
  await db.delete(schema.events)

  const createEvent = () => ({
    title: faker.company.catchPhrase(),
    start_date: faker.date.past(),
    end_date: addDays(
      faker.date.future(),
      faker.number.int({ min: 1, max: 14 })
    ),
  })

  const events = Array.from({ length: 10 }).map(() => createEvent())

  await db.insert(schema.events).values(events)

  console.log('🌱 Database seeded with events!')
}

main()
  .catch(err => console.error(err))
  .finally(() => client.end())
