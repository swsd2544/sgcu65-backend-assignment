import { Status } from '@prisma/client'
import { Type } from 'class-transformer'
import { IsArray, IsDate, IsNotEmpty, IsNumber } from 'class-validator'

export class CreateTaskDto {
  @IsNotEmpty()
  name: string

  content: string

  status: Status

  @Type(() => Date)
  @IsDate()
  deadline: Date

  @IsArray()
  @IsNumber({}, { each: true })
  userIds: number[]
}
