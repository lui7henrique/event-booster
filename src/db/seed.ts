import { addDays } from 'date-fns'
import { client, db } from '.'
import { schema } from './schema'

async function main() {
  await db.delete(schema.events)

  await db.insert(schema.events).values({
    title: 'Vercel Con',
    start_date: new Date(),
    end_date: addDays(new Date(), 7),
  })

  console.log('🌱 Database seeded!')
}

main()
  .catch(err => console.error(err))
  .finally(() => client.end())
