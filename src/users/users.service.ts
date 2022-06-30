import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'
import { userSelect } from 'src/types'
import { generateHashedPassword } from 'src/utils/bcrypt'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { password, ...data } = createUserDto
    const userDb = await this.prisma.user.findFirst({
      where: { email: data.email, deletedAt: null },
    })
    if (userDb) {
      throw new BadRequestException('User already exists')
    }
    const hashedPassword = await generateHashedPassword(password)
    return await this.prisma.user.create({
      select: userSelect,
      data: {
        ...data,
        password: hashedPassword,
      },
    })
  }

  async findAll(search: string, searchFields: string[]) {
    const whereOption: Prisma.UserWhereInput = { deletedAt: null }
    if (search && search !== '') {
      whereOption.OR = searchFields.map((field) => ({
        [field]: { contains: search },
      }))
    }
    return await this.prisma.user.findMany({
      select: userSelect,
      where: whereOption,
      orderBy: { id: 'asc' },
    })
  }

  async findOne(id: number) {
    const userDb = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: userSelect,
    })
    if (!userDb) {
      throw new NotFoundException('User not found')
    }
    return userDb
  }

  // Use for authentication only
  async findOneByEmail(email: string) {
    const userDb = await this.prisma.user.findFirst({
      where: { email, deletedAt: null },
    })
    return userDb
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const { password, ...data } = updateUserDto
    const userDb = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
    })
    if (!userDb) {
      throw new NotFoundException('User not found')
    }
    if (
      data.email &&
      data.email !== userDb.email &&
      (await this.prisma.user.findFirst({
        where: { email: data.email },
      }))
    ) {
      throw new BadRequestException('This email already exists')
    }
    const hashedPassword = password && (await generateHashedPassword(password))
    const user = await this.prisma.user.update({
      where: { id: userDb.id },
      data: {
        ...data,
        password: hashedPassword,
      },
      select: userSelect,
    })
    return user
  }

  async remove(id: number) {
    const userDb = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
    })
    if (!userDb) {
      throw new NotFoundException('User not found')
    }
    await this.prisma.$transaction([
      this.prisma.user.delete({ where: { id } }),
      this.prisma.task.updateMany({
        where: { userId: id },
        data: { userId: null },
      }),
      this.prisma.teamsTasks.deleteMany({
        where: { assignerId: id },
      }),
      this.prisma.usersTeams.deleteMany({
        where: { userId: id },
      }),
    ])
  }
}
