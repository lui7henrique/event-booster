export class SubscriptionNotFound extends Error {
  constructor() {
    super('Subscription not found.')
  }
}
