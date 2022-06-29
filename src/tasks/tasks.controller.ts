import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Req,
  UseGuards,
  Put,
  HttpStatus,
} from '@nestjs/common'
import { Request } from 'express'
import { Role, User } from '@prisma/client'
import { TasksService } from './tasks.service'
import { CreateTaskDto } from './dto/create-task.dto'
import { UpdateTaskDto } from './dto/update-task.dto'
import { Roles } from 'src/auth/decorator/roles.decorator'
import { RolesGuard } from 'src/auth/guard/roles.guard'
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard'

@UseGuards(RolesGuard)
@UseGuards(JwtAuthGuard)
@Roles(Role.ADMIN)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@Body() createTaskDto: CreateTaskDto, @Req() req: Request) {
    console.log(createTaskDto)
    return this.tasksService.create(req.user as User, createTaskDto)
  }

  @Get()
  findAll(
    @Query('search') search: string,
    @Query('searchField') searchFields: string | string[]
  ) {
    const fields =
      typeof searchFields === 'string' ? [searchFields] : searchFields
    return this.tasksService.findAll(search, fields)
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.tasksService.findOne(id)
  }

  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() updateTaskDto: UpdateTaskDto,
    @Req() req: Request
  ) {
    return this.tasksService.update(id, req.user as User, updateTaskDto)
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    await this.tasksService.remove(id)
    return { message: 'Successfully delete', status: HttpStatus.OK }
  }
}
