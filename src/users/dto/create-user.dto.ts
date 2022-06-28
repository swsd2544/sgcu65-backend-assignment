import { Role } from '@prisma/client'

export class CreateUserDto {
  email: string
  password: string
  firstname: string
  lastname: string
  role: Role
}
