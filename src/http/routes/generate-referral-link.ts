import { generateReferralLink } from '@/app/functions/generate-referral-link'
import { isLeft } from '@/core/either'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

const generateReferralLinkSchema = z.object({
  email: z.string().email('Invalid email format').default('john-doe@gmail.com'),

  eventId: z.string().min(1, 'Event ID is required').default(''),
})

export async function generateReferralLinkRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/generate-referral-link',
    schema: {
      description: 'Generate event referral link',
      tags: ['Referral link'],
      body: generateReferralLinkSchema,
      response: {
        201: z.object({
          // referral_link: z.object({
          //   email: z.string(),
          //   event_id: z.string().nullable(),
          //   referral_link: z.string(),
          //   id: z.string(),
          //   created_at: z.date(),
          //   token: z.string(),
          //   click_count: z.number(),
          //   subscription_count: z.number(),
          //   parent_id: z.string().nullable(),
          // }),
        }),
        400: z.object({
          message: z.string().describe('Error occurred'),
        }),
        409: z.object({
          message: z.string().describe('Referral link already exists'),
        }),
      },
    },
    handler: async (request, reply) => {
      const { email, eventId } = generateReferralLinkSchema.parse(request.body)

      const result = await generateReferralLink({ email, eventId })

      if (isLeft(result)) {
        const error = result.left

        switch (error.constructor.name) {
          case 'ReferralLinkAlreadyExists':
            return reply.status(409).send({ message: error.message })

          default:
            return reply.status(400).send({ message: 'An error occurred' })
        }
      }

      return reply
        .status(201)
        .send({ referral_link: result.right.referralLink })
    },
  })
}
