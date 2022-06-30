import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  HttpStatus,
  UseGuards,
  Query,
  BadRequestException,
} from '@nestjs/common'
import { UsersService } from './users.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard'
import { Roles } from 'src/auth/decorator/roles.decorator'
import { Role } from '@prisma/client'
import { RolesGuard } from 'src/auth/guard/roles.guard'

enum baseSearchFields {
  email = 'email',
  firstname = 'firstname',
  lastname = 'lastname',
}
@UseGuards(RolesGuard)
@UseGuards(JwtAuthGuard)
@Roles(Role.ADMIN)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto)
  }

  @Get()
  findAll(
    @Query('search') search: string,
    @Query('searchField')
    searchFields: string | string[] = Object.values(baseSearchFields)
  ) {
    const fields =
      typeof searchFields === 'string' ? [searchFields] : searchFields
    if (
      fields.some(
        (field) =>
          !Object.values(baseSearchFields).includes(field as baseSearchFields)
      )
    ) {
      throw new BadRequestException('Invalid fields')
    }
    return this.usersService.findAll(search, fields)
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.usersService.findOne(id)
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto)
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    await this.usersService.remove(id)
    return { message: 'Successfully delete', status: HttpStatus.OK }
  }
}
