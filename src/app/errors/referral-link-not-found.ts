export class ReferralLinkNotFound extends Error {
  constructor(message?: string) {
    super(message ?? 'Referral link not found.')
  }
}
