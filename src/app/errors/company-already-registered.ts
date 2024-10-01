export class HostEmailAlreadyRegisteredError extends Error {
  constructor(message?: string) {
    super(message ?? 'This host e-mail is already registered.')
  }
}
