import { PrismaService } from './prisma/prisma.service'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import csurf from 'csurf'
import config from './config'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true })
  app.useGlobalPipes(new ValidationPipe({ transform: true }))
  app.use(helmet())
  app.use(cookieParser())
  app.use(csurf())
  const prismaService = app.get(PrismaService)
  await prismaService.enableShutdownHooks(app)
  await app.listen(config.port)
}
bootstrap()
