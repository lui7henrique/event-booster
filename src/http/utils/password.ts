import bcrypt from 'bcrypt'

export async function hashPassword(
  password: string,
  salt = 10
): Promise<string> {
  const saltRounds = salt

  return await bcrypt.hash(password, saltRounds)
}

export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}
