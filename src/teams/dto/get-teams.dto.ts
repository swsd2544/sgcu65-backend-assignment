import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator'

enum baseSearchFields {
  name = 'name',
}

export class GetTeamsDto {
  @IsString()
  @IsOptional()
  search?: string

  @IsArray()
  @IsEnum(baseSearchFields, {
    each: true,
    message: `Search field must be in [${Object.values(baseSearchFields).join(
      ', '
    )}]`,
  })
  searchFields: baseSearchFields[] = Object.values(baseSearchFields)
}
