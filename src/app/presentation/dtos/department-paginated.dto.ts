import { ApiProperty } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  Max,
  Min,
  IsEnum,
  IsString,
  IsObject,
} from 'class-validator';
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
  @IsObject()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value) as Record<string, any>;
      } catch {
        return value as unknown as Record<string, any>;
      }
    }
    return value as Record<string, any>;
  })
  @ApiProperty({
    description: 'Strapi-style filters object',
    required: false,
    example: {
      name: { $contains: 'Engineering' },
      managerId: { $notNull: true },
    },
  })
  readonly filters?: Record<string, any>;
}

export class DepartmentPaginatedResponseDto extends PaginatedResponseDto<DepartmentResponseDto> {
  @ApiProperty({ type: [DepartmentResponseDto] })
  declare readonly data: readonly DepartmentResponseDto[];
}
