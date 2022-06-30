import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  BadRequestException,
  Put,
  HttpStatus,
  UseGuards,
} from '@nestjs/common'
import { TeamsService } from './teams.service'
import { CreateTeamDto } from './dto/create-team.dto'
import { UpdateTeamDto } from './dto/update-team.dto'
import { RolesGuard } from 'src/auth/guard/roles.guard'
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard'
import { Role } from '@prisma/client'
import { Roles } from 'src/auth/decorator/roles.decorator'

enum baseSearchFields {
  name = 'name',
}

@UseGuards(RolesGuard)
@UseGuards(JwtAuthGuard)
@Roles(Role.ADMIN)
@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  create(@Body() createTeamDto: CreateTeamDto) {
    return this.teamsService.create(createTeamDto)
  }

  @Get()
  findAll(
    @Query('search') search: string,
    @Query('searchFields')
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
      throw new BadRequestException('Invalid search fields')
    }
    return this.teamsService.findAll(search, fields)
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.teamsService.findOne(id)
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() updateTeamDto: UpdateTeamDto) {
    return this.teamsService.update(id, updateTeamDto)
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    await this.teamsService.remove(id)
    return { message: 'Successfully delete', status: HttpStatus.OK }
  }
}
