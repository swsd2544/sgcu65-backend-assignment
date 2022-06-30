import { Role } from '@prisma/client'
import { IsEmail, IsNotEmpty } from 'class-validator'

export class CreateUserDto {
  @IsEmail()
  email: string

  @IsNotEmpty()
  password: string

  firstname: string

  lastname: string

  @IsNotEmpty()
  role: Role = Role.USER
}
