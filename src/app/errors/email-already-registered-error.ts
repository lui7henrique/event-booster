export class EmailAlreadySubscribedError extends Error {
  constructor(message?: string) {
    super(message ?? 'This email is already subscribed for the event.')
  }
}
