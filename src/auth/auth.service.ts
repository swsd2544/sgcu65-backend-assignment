import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UsersService } from 'src/users/users.service'
import { comparePassword } from 'src/utils/bcrypt'
import { SignupDto } from './dto/signup.dto'

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  async validateUser(email: string, password: string) {
    const userDb = await this.usersService.findOneByEmail(email)
    if (userDb && (await comparePassword(password, userDb.password))) {
      const { password, deletedAt, updatedAt, ...user } = userDb
      return user
    }
    return null
  }

  async login(user: any) {
    const payload = { sub: user.id }
    return {
      access_token: this.jwtService.sign(payload),
    }
  }

  async signup(signupDto: SignupDto) {
    const userDb = await this.usersService.create({
      ...signupDto,
      role: 'USER',
    })
    return this.login(userDb)
  }
}
