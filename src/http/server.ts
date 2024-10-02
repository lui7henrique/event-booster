import fastifyCors from '@fastify/cors'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import fastifyJwt from '@fastify/jwt'
import fastify from 'fastify'

import { env } from '../env'
import { ZodError } from 'zod'

import { registerSubscriptionRoute } from './routes/register-subscription'
import { generateReferralLinkRoute } from './routes/generate-referral-link'
import { registerEventRoute } from './routes/register-event'
import { registerHostRoute } from './routes/register-host'
import { loginRoute } from './routes/login'
import { getEventsRoutes } from './routes/get-events'
import { incrementReferralLinkCountRoute } from './routes/increment-referral-link-count'
import { getReferralLinkStatsRoute } from './routes/get-referral-link-stats'
import { getEventRankingRoute } from './routes/get-event-ranking'
import fastifyRedis from '@fastify/redis'
import fastifyRateLimit from '@fastify/rate-limit'

const app = fastify()

app.register(fastifyCors, {
  origin: '*',
})

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
})

app.register(fastifyRedis, {
  url: env.REDIS_URL,
})

app.register(fastifyRateLimit, {
  max: 100,
  timeWindow: '1 min',
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
        url: env.BASE_URL,
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
app.register(getEventRankingRoute)
app.register(getEventsRoutes)
app.register(registerHostRoute)
app.register(generateReferralLinkRoute)
app.register(incrementReferralLinkCountRoute)
app.register(getReferralLinkStatsRoute)
app.register(loginRoute)

app.setErrorHandler((error, _, reply) => {
  if (error instanceof ZodError) {
    return reply
      .status(400)
      .send({ message: 'Validation error.', issues: error.format() })
  }

  if (error.statusCode === 429) {
    return reply
      .code(429)
      .send({ message: 'You hit the rate limit! Slow down please!' })
  }

  if (env.NODE_ENV !== 'production') {
    console.error(error)
  } else {
    // TODO: DataDog/NewRelic/Sentry
  }

  return reply.status(500).send({ message: 'Internal server error.' })
})

app.ready()
app.listen().then(() => {
  console.log('HTTP server running!')
})
