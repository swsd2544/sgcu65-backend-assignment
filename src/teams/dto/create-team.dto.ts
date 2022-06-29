import { IsArray, IsNotEmpty, IsNumber } from 'class-validator'

export class CreateTeamDto {
  @IsNotEmpty()
  name: string

  @IsArray()
  @IsNumber({}, { each: true })
  userIds: number[] = []
}
