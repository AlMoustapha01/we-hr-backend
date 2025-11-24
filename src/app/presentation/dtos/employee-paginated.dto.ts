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
import { EmployeeResponseDto } from './employee-response.dto';

export class EmployeePaginatedQueryDto {
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
    description:
      'Field to order by (name, email, joinDate, salary, createdAt, updatedAt)',
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
      name: { $contains: 'John' },
      status: { $eq: 'ACTIVE' },
      position: { $in: ['SENIOR', 'MANAGER'] },
      salary: { $gte: 50000 },
    },
  })
  readonly filters?: Record<string, any>;
}

export class EmployeePaginatedResponseDto extends PaginatedResponseDto<EmployeeResponseDto> {
  @ApiProperty({ type: [EmployeeResponseDto] })
  declare readonly data: readonly EmployeeResponseDto[];
}
