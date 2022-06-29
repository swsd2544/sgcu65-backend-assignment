import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'
import { teamSelect } from 'src/types'
import { CreateTeamDto } from './dto/create-team.dto'
import { UpdateTeamDto } from './dto/update-team.dto'

@Injectable()
export class TeamsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTeamDto: CreateTeamDto) {
    const { userIds, ...data } = createTeamDto
    const [teamDb, numberUsers] = await Promise.all([
      this.prisma.team.findFirst({
        where: { name: data.name, deletedAt: null },
      }),
      this.prisma.user.count({ where: { id: { in: userIds } } }),
    ])
    if (teamDb) {
      throw new BadRequestException('This team name is already used')
    }
    if (userIds.length !== numberUsers) {
      throw new BadRequestException("Some users aren't existed in the database")
    }
    return await this.prisma.team.create({
      select: teamSelect,
      data: {
        ...data,
        usersTeams: {
          createMany: {
            data: userIds.map((userId) => ({
              userId,
            })),
          },
        },
      },
    })
  }

  async findAll(search: string, searchFields: string[]) {
    const whereOption: Prisma.TeamWhereInput = { deletedAt: null }
    if (search && search !== '') {
      whereOption.OR = searchFields.map((field) => ({
        [field]: { contains: search },
      }))
    }
    return await this.prisma.team.findMany({
      select: teamSelect,
      where: whereOption,
      orderBy: { id: 'asc' },
    })
  }

  async findOne(id: number) {
    const teamDb = await this.prisma.team.findFirst({
      select: teamSelect,
      where: { id, deletedAt: null },
    })
    if (!teamDb) {
      throw new NotFoundException('Team not found')
    }
    return teamDb
  }

  async update(id: number, updateTeamDto: UpdateTeamDto) {
    const { userIds, ...data } = updateTeamDto
    const [teamDb, numberUsers] = await Promise.all([
      this.prisma.team.findFirst({
        where: { id, deletedAt: null },
      }),
      this.prisma.user.count({ where: { id: { in: userIds } } }),
    ])
    if (!teamDb) {
      throw new NotFoundException('Team not found')
    }
    if (userIds.length !== numberUsers) {
      throw new BadRequestException("Some users aren't existed in the database")
    }
    if (
      data.name &&
      data.name !== teamDb.name &&
      (await this.prisma.team.findFirst({
        where: { name: data.name, deletedAt: null },
      }))
    ) {
      throw new BadRequestException('This team name is already existed')
    }
    return await this.prisma.team.update({
      where: { id },
      select: teamSelect,
      data: {
        ...data,
        usersTeams: {
          upsert: userIds.map((userId) => ({
            where: { usersTeamsIdentifier: { userId, teamId: id } },
            update: {},
            create: {
              userId,
            },
          })),
        },
      },
    })
  }

  async remove(id: number) {
    const teamDb = await this.prisma.team.findFirst({
      where: { id, deletedAt: null },
    })
    if (!teamDb) {
      throw new NotFoundException('Team not found')
    }
    await this.prisma.$transaction([
      this.prisma.team.delete({ where: { id } }),
      this.prisma.teamsTasks.deleteMany({ where: { teamId: id } }),
      this.prisma.usersTeams.deleteMany({ where: { teamId: id } }),
    ])
  }
}
