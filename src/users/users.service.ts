import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'
import { generateHashedPassword } from 'src/utils/bcrypt'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'

const baseUserSelect = {
  id: true,
  email: true,
  firstname: true,
  lastname: true,
  role: true,
  createdAt: true,
}

const baseSearchFields = ['email', 'firstname', 'lastname']

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const userDb = await this.prisma.user.findFirst({
      where: { email: createUserDto.email },
    })
    if (userDb) {
      throw new BadRequestException('User already exists')
    }
    const hashedPassword = await generateHashedPassword(createUserDto.password)
    return await this.prisma.user.create({
      data: { ...createUserDto, password: hashedPassword },
      select: baseUserSelect,
    })
  }

  async findAll(search: string, searchFields: string[] = baseSearchFields) {
    const whereOption: Prisma.UserWhereInput = {}
    if (search && search !== '') {
      whereOption.OR = searchFields.map((field) => ({
        [field]: { contains: search },
      }))
    }
    return await this.prisma.user.findMany({
      select: baseUserSelect,
      where: whereOption,
    })
  }

  async findOne(id: number) {
    const userDb = await this.prisma.user.findUnique({
      where: { id },
      select: baseUserSelect,
    })
    if (!userDb) {
      throw new NotFoundException('User not found')
    }
    return userDb
  }

  // Use for authentication only
  async findOneByEmail(email: string) {
    const userDb = await this.prisma.user.findFirst({ where: { email } })
    return userDb
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const userDb = await this.prisma.user.findUnique({
      where: { id },
      select: baseUserSelect,
    })
    if (!userDb) {
      throw new NotFoundException('User not found')
    }
    if (
      updateUserDto.email &&
      (await this.prisma.user.findFirst({
        where: { email: updateUserDto.email },
      }))
    ) {
      throw new BadRequestException('This email already exists')
    }
    await this.prisma.user.update({
      where: { id: userDb.id },
      data: updateUserDto,
    })
    return { ...userDb, ...updateUserDto }
  }

  async remove(id: number) {
    const userDb = await this.prisma.user.findUnique({ where: { id } })
    if (!userDb) {
      throw new NotFoundException('User not found')
    }
    await this.prisma.user.delete({ where: { id } })
  }
}
