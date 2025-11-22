import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min, IsEnum, IsString } from 'class-validator';
import { PaginatedResponseDto } from '@/libs/api/paginated.response.base';
import { DepartmentResponseDto } from './department-response.dto';

export class DepartmentPaginatedQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  @ApiProperty({
    example: 10,
    description: 'Number of items per page',
    required: false,
    default: 10,
  })
  readonly limit?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @ApiProperty({
    example: 1,
    description: 'Page number',
    required: false,
    default: 1,
  })
  readonly page?: number;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'name',
    description: 'Field to order by (name, createdAt, updatedAt)',
    required: false,
  })
  readonly orderBy?: string;

  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  @ApiProperty({
    example: 'ASC',
    description: 'Order direction',
    enum: ['ASC', 'DESC'],
    required: false,
    default: 'ASC',
  })
  readonly orderDirection?: 'ASC' | 'DESC';

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'Engineering',
    description: 'Filter by department name',
    required: false,
  })
  readonly name?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Filter by manager ID',
    required: false,
  })
  readonly managerId?: string;
}

export class DepartmentPaginatedResponseDto extends PaginatedResponseDto<DepartmentResponseDto> {
  @ApiProperty({ type: [DepartmentResponseDto] })
  declare readonly data: readonly DepartmentResponseDto[];
}
