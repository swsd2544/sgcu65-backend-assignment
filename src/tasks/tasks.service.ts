import { baseUserSelect } from 'src/users/users.service'
import { Prisma, User } from '@prisma/client'
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateTaskDto } from './dto/create-task.dto'
import { UpdateTaskDto } from './dto/update-task.dto'

const baseTaskSelect: Prisma.TaskSelect = {
  id: true,
  name: true,
  content: true,
  deadline: true,
  createdBy: { select: baseUserSelect },
  usersTasks: { select: { user: { select: baseUserSelect } } },
}

const baseSearchFields = ['id', 'name', 'content']

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: User, createTaskDto: CreateTaskDto) {
    const [taskDb, numberUsers] = await Promise.all([
      this.prisma.task.findFirst({
        where: { name: createTaskDto.name, deletedAt: null },
      }),
      this.prisma.user.count({
        where: { id: { in: createTaskDto.userIds }, deletedAt: null },
      }),
    ])
    if (taskDb) {
      throw new BadRequestException('Task already exists')
    }
    if (numberUsers !== createTaskDto.userIds.length) {
      throw new BadRequestException("Some users aren't existed in the database")
    }
    return await this.prisma.task.create({
      select: baseTaskSelect,
      data: {
        name: createTaskDto.name,
        content: createTaskDto.content,
        status: createTaskDto.status,
        createdBy: { connect: { id: user.id } },
        deadline: new Date(createTaskDto.deadline),
        usersTasks: {
          create: createTaskDto.userIds.map((assigneeId) => ({
            assignBy: {
              connect: {
                id: user.id,
              },
            },
            user: {
              connect: {
                id: assigneeId,
              },
            },
          })),
        },
      },
    })
  }

  async findAll(search: string, searchFields: string[] = baseSearchFields) {
    const whereOption: Prisma.TaskWhereInput = { deletedAt: null }
    if (search && search !== '') {
      whereOption.OR = searchFields.map((field) => ({
        [field]: { contains: search },
      }))
    }
    return await this.prisma.task.findMany({
      select: baseTaskSelect,
      where: whereOption,
    })
  }

  async findOne(id: number) {
    const taskDb = await this.prisma.task.findFirst({
      where: { id, deletedAt: null },
      select: baseTaskSelect,
    })
    if (!taskDb) {
      throw new NotFoundException('Task not found')
    }
    return taskDb
  }

  async update(id: number, user: User, updateTaskDto: UpdateTaskDto) {
    const taskDb = await this.prisma.task.findFirst({
      where: { id, deletedAt: null },
      select: baseTaskSelect,
    })
    if (!taskDb) {
      throw new NotFoundException('Task not found')
    }
    if (
      updateTaskDto.name &&
      (await this.prisma.task.findFirst({
        where: { name: updateTaskDto.name, deletedAt: null },
      }))
    ) {
      throw new BadRequestException('This task name already exists')
    }
    if (
      updateTaskDto.userIds &&
      (await this.prisma.user.count({
        where: { id: { in: updateTaskDto.userIds }, deletedAt: null },
      })) !== updateTaskDto.userIds.length
    ) {
      throw new BadRequestException("Some users aren't existed in the database")
    }
    const task = await this.prisma.task.update({
      where: { id },
      select: baseTaskSelect,
      data: {
        name: updateTaskDto.name,
        content: updateTaskDto.content,
        status: updateTaskDto.status,
        deadline: updateTaskDto.deadline && new Date(updateTaskDto.deadline),
        usersTasks: {
          upsert: updateTaskDto.userIds.map((assigneeId) => ({
            where: {
              usersTasksIdentifier: { userId: assigneeId, taskId: id },
            },
            create: {
              assignBy: {
                connect: {
                  id: user.id,
                },
              },
              user: {
                connect: {
                  id: assigneeId,
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
      this.prisma.usersTasks.deleteMany({ where: { taskId: id } }),
    ])
  }
}
