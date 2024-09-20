export class ReferralLinkAlreadyExists extends Error {
  constructor(message?: string) {
    super(message ?? 'Referral link already exists.')
  }
}
