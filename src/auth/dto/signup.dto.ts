import { IsEmail, IsNotEmpty } from 'class-validator'

export class SignupDto {
  @IsEmail()
  email: string

  @IsNotEmpty()
  password: string
  firstname: string
  lastname: string
}
