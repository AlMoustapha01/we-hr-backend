import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsUUID,
  MinLength,
  IsOptional,
} from 'class-validator';

export class CreateDepartmentDto {
  @ApiProperty({
    example: 'Engineering',
    description: 'Department name',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  readonly name: string;

  @ApiProperty({
    example:
      'Responsible for software development and technical infrastructure',
    description: 'Department description',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  readonly description: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID of the employee who will manage this department',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
  readonly managerId?: string;
}
