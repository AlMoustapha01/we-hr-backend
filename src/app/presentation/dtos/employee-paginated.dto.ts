import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min, IsEnum, IsString } from 'class-validator';
import { PaginatedResponseDto } from '@/libs/api/paginated.response.base';
import { EmployeeResponseDto } from './employee-response.dto';
import { EmployeeStatus, EmployeePosition } from '@/app/domain/employee';

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
  @IsString()
  @ApiProperty({
    example: 'John',
    description: 'Filter by employee name (partial match)',
    required: false,
  })
  readonly name?: string;

  @IsOptional()
  @IsEnum(EmployeeStatus)
  @ApiProperty({
    example: EmployeeStatus.ACTIVE,
    description: 'Filter by employee status',
    enum: EmployeeStatus,
    required: false,
  })
  readonly status?: EmployeeStatus;

  @IsOptional()
  @IsEnum(EmployeePosition)
  @ApiProperty({
    example: EmployeePosition.SENIOR,
    description: 'Filter by employee position',
    enum: EmployeePosition,
    required: false,
  })
  readonly position?: EmployeePosition;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Filter by department ID',
    required: false,
  })
  readonly departmentId?: string;
}

export class EmployeePaginatedResponseDto extends PaginatedResponseDto<EmployeeResponseDto> {
  @ApiProperty({ type: [EmployeeResponseDto] })
  declare readonly data: readonly EmployeeResponseDto[];
}
