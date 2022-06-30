import * as bcrypt from 'bcrypt'

export async function generateHashedPassword(password: string) {
  const saltOrRounds = await bcrypt.genSalt()
  const hash = await bcrypt.hash(password, saltOrRounds)
  return hash
}

export async function comparePassword(password: string, hash: string) {
  return await bcrypt.compare(password, hash)
}
