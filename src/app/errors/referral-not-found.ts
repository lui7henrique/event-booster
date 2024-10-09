export class ReferralNotFound extends Error {
  constructor(message?: string) {
    super(message ?? 'Referral not found.')
  }
}
