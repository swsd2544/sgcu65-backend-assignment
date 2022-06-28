import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { JwtModule } from '@nestjs/jwt'
import { UsersModule } from 'src/users/users.module'
import { AuthService } from './auth.service'
import { LocalStrategy } from './strategy/local.strategy'
import { JwtStrategy } from './strategy/jwt.strategy'
import config from 'src/config'

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: config.secret,
      signOptions: { expiresIn: '24h' },
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
