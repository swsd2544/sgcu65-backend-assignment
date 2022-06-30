import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { PrismaModule } from './prisma/prisma.module'
import { UsersModule } from './users/users.module'
import { AuthModule } from './auth/auth.module'
import { TasksModule } from './tasks/tasks.module'
import { TeamsModule } from './teams/teams.module'

@Module({
  imports: [PrismaModule, UsersModule, AuthModule, TasksModule, TeamsModule],
  controllers: [AppController],
})
export class AppModule {}
