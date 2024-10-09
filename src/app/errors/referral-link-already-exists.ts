export class ReferralLinkAlreadyExists extends Error {
  constructor(message?: string) {
    super(message ?? 'Referral already exists.')
  }
}
