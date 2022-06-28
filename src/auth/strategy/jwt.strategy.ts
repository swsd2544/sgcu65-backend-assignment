import { PrismaService } from './../../prisma/prisma.service'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import config from 'src/config'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.secret,
    })
  }

  async validate(payload: { sub: number }) {
    const user = await this.prisma.user.findFirst({
      where: { id: payload.sub, deletedAt: null },
    })
    if (!user) {
      throw new UnauthorizedException("The user wasn't existed in the database")
    }
    return user
  }
}
