import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common'
import { Request } from 'express'
import { AuthService } from './auth/auth.service'
import { SignupDto } from './auth/dto/signup.dto'
import { JwtAuthGuard } from './auth/guard/jwt-auth.guard'
import { LocalAuthGuard } from './auth/guard/local-auth.guard'
import { UsersService } from './users/users.service'

@Controller()
export class AppController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Req() req: Request) {
    return this.authService.login(req.user)
  }

  @Post('auth/signup')
  async signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto)
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req: Request) {
    return this.usersService.findOne((req.user as any).id)
  }
}
