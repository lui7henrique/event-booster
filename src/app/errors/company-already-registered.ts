export class CompanyAlreadyRegisteredError extends Error {
  constructor(message?: string) {
    super(message ?? 'This company e-mail is already registered.')
  }
}
