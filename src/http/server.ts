import fastifyCors from '@fastify/cors'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import fastifyJwt from '@fastify/jwt'
import fastify from 'fastify'

import { env } from '../env'
import { ZodError } from 'zod'

import { registerSubscriptionRoute } from './routes/register-subscription'
import { generateReferralLinkRoute } from './routes/generate-referral-link'
import { handleReferralLinkRoute } from './routes/handle-referral-link'
import { registerEventRoute } from './routes/register-event'
import { registerCompanyRoute } from './routes/register-company'
import { loginRoute } from './routes/login'
import { getEventsRoutes } from './routes/get-events'

const app = fastify()

app.register(fastifyCors, {
  origin: '*',
})

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
})

app.register(fastifySwagger, {
  openapi: {
    openapi: '3.0.0',
    info: {
      title: 'Event booster',
      version: '0.1.0',
    },
    servers: [
      {
        url: 'http://localhost:3333',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
})

app.register(fastifySwaggerUi, {
  routePrefix: '/api-docs',
})

app.register(registerSubscriptionRoute)
app.register(registerEventRoute)
app.register(getEventsRoutes)
app.register(registerCompanyRoute)
app.register(generateReferralLinkRoute)
app.register(handleReferralLinkRoute)
app.register(loginRoute)

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

app.ready()
app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log('HTTP server running!')
  })
