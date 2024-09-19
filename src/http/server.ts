import cors from '@fastify/cors'
import fastify from 'fastify'

import { registerSubscriptionRoute } from './routes/register-subscription'

import { env } from '../env'
import { ZodError } from 'zod'

const app = fastify()

app.register(cors, {
  origin: '*',
})

app.register(registerSubscriptionRoute)

app.setErrorHandler((error, _, reply) => {
  if (error instanceof ZodError) {
    return reply
      .status(400)
      .send({ message: 'Validation error.', issues: error.format() })
  }

  if (env.NODE_ENV !== 'production') {
    console.error(error)
  } else {
    // TODO: DataDog/NewRelic/Sentry
  }

  return reply.status(500).send({ message: 'Internal server error.' })
})

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log('HTTP server running!')
  })
