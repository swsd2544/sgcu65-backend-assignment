import { Prisma, User } from '@prisma/client'
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateTaskDto } from './dto/create-task.dto'
import { UpdateTaskDto } from './dto/update-task.dto'
import { taskSelect } from 'src/types'

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: User, createTaskDto: CreateTaskDto) {
    const { teamIds = [], ...data } = createTaskDto
    const [taskDb, numberTeams] = await Promise.all([
      this.prisma.task.findFirst({
        where: { name: createTaskDto.name, deletedAt: null },
      }),
      this.prisma.team.count({
        where: { id: { in: teamIds }, deletedAt: null },
      }),
    ])
    if (taskDb) {
      throw new BadRequestException('Task already exists')
    }
    if (numberTeams !== teamIds.length) {
      throw new BadRequestException("Some teams aren't existed in the database")
    }
    return await this.prisma.task.create({
      select: taskSelect,
      data: {
        ...data,
        createdBy: { connect: { id: user.id } },
        teamsTasks: {
          create: teamIds.map((teamId) => ({
            assignBy: {
              connect: {
                id: user.id,
              },
            },
            team: {
              connect: {
                id: teamId,
              },
            },
          })),
        },
      },
    })
  }

  async findAll(search: string, searchFields: string[]) {
    const whereOption: Prisma.TaskWhereInput = { deletedAt: null }
    if (search && search !== '') {
      whereOption.OR = searchFields.map((field) => ({
        [field]: { contains: search },
      }))
    }
    return await this.prisma.task.findMany({
      select: taskSelect,
      where: whereOption,
      orderBy: { id: 'asc' },
    })
  }

  async findOne(id: number) {
    const taskDb = await this.prisma.task.findFirst({
      where: { id, deletedAt: null },
      select: taskSelect,
    })
    if (!taskDb) {
      throw new NotFoundException('Task not found')
    }
    return taskDb
  }

  async update(id: number, user: User, updateTaskDto: UpdateTaskDto) {
    const { teamIds = [], ...data } = updateTaskDto
    const [taskDb, numberTeams] = await Promise.all([
      this.prisma.task.findFirst({
        where: { id, deletedAt: null },
        select: taskSelect,
      }),
      this.prisma.team.count({
        where: { id: { in: teamIds }, deletedAt: null },
      }),
    ])
    if (!taskDb) {
      throw new NotFoundException('Task not found')
    }
    if (teamIds.length !== numberTeams) {
      throw new BadRequestException("Some users aren't existed in the database")
    }
    if (
      data.name &&
      data.name !== taskDb.name &&
      (await this.prisma.task.findFirst({
        where: { name: data.name, deletedAt: null },
      }))
    ) {
      throw new BadRequestException('This task name already exists')
    }
    const task = await this.prisma.task.update({
      where: { id },
      select: taskSelect,
      data: {
        ...data,
        teamsTasks: {
          upsert: teamIds.map((teamId) => ({
            where: {
              teamsTasksIdentifier: { teamId: teamId, taskId: id },
            },
            create: {
              assignBy: {
                connect: {
                  id: user.id,
                },
              },
              team: {
                connect: {
                  id: teamId,
                },
              },
            },
            update: {},
          })),
        },
      },
    })
    return task
  }

  async remove(id: number) {
    const taskDb = await this.prisma.task.findFirst({
      where: { id, deletedAt: null },
    })
    if (!taskDb) {
      throw new NotFoundException('Task not found')
    }
    await this.prisma.$transaction([
      this.prisma.task.delete({ where: { id } }),
      this.prisma.teamsTasks.deleteMany({ where: { taskId: id } }),
    ])
  }
}
