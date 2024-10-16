import '@/config/instrumentation'

import fastifyCors from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import fastifyRateLimit from '@fastify/rate-limit'
import fastifyRedis from '@fastify/redis'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import fastify from 'fastify'
import Sentry from '@sentry/node'

import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'

import { ZodError } from 'zod'
import { env } from '../env'

import { generateReferralRoute } from './routes/generate-referral'
import { getEventRankingRoute } from './routes/get-event-ranking'
import { getEventsRoute } from './routes/get-events'
import { getReferralStatsRoute } from './routes/get-referral-stats'
import { incrementReferralClickCountRoute } from './routes/increment-referral-click-count'
import { loginRoute } from './routes/login'
import { registerEventRoute } from './routes/register-event'
import { registerHostRoute } from './routes/register-host'
import { registerSubscriptionRoute } from './routes/register-subscription'

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

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

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
  transform: schema => {
    try {
      return jsonSchemaTransform(schema)
    } catch (err) {
      console.error('Error transforming schema:', err)

      return schema
    }
  },
})

app.register(fastifySwaggerUi, {
  routePrefix: '/api-docs',
})

app.register(registerSubscriptionRoute)
app.register(registerEventRoute)
app.register(registerHostRoute)
app.register(getEventRankingRoute)
app.register(getEventsRoute)
app.register(getReferralStatsRoute)
app.register(generateReferralRoute)
app.register(incrementReferralClickCountRoute)
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

Sentry.setupFastifyErrorHandler(app)

app
  .listen({
    port: env.PORT,
    host: '0.0.0.0',
  })
  .then(() => {
    console.log(`HTTP server running at: ${env.BASE_URL}`)
  })
