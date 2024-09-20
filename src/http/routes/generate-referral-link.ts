import { generateReferralLink } from '@/app/functions/generate-referral-link'
import { isLeft } from '@/core/either'
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

export async function generateReferralLinkRoute(app: FastifyInstance) {
  app.post('/generate-referral-link', async (request, reply) => {
    const headers = z.object({
      email: z.string().email(),
      event_id: z.string(),
    })

    const { email, event_id } = headers.parse(request.body)

    const result = await generateReferralLink({
      email,
      event_id,
    })

    if (isLeft(result)) {
      const error = result.left

      switch (error.constructor.name) {
        case 'ReferralLinkAlreadyExists':
          return reply.status(409).send({ message: error.message })

        default:
          return reply.status(400).send()
      }
    }

    return reply.status(201).send({ referral_link: result.right.referralLink })
  })
}
