import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsNumber,
  IsUUID,
  Min,
  MinLength,
} from 'class-validator';
import { EmployeePosition } from '@/app/domain/employee';

export class UpdateEmployeeDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'Employee full name',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MinLength(2)
  readonly name?: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Employee email address',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  readonly email?: string;

  @ApiProperty({
    example: '+1234567890',
    description: 'Employee phone number',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MinLength(10)
  readonly phone?: string;

  @ApiProperty({
    example: EmployeePosition.SENIOR,
    description: 'Employee position level',
    enum: EmployeePosition,
    required: false,
  })
  @IsEnum(EmployeePosition)
  @IsOptional()
  readonly position?: EmployeePosition;

  @ApiProperty({
    example: 'Software Engineer',
    description: 'Employee role/job title',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MinLength(2)
  readonly role?: string;

  @ApiProperty({
    example: 75000,
    description: 'Employee salary',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  readonly salary?: number;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Department ID. Set to null to remove from department.',
    required: false,
    nullable: true,
  })
  @IsUUID()
  @IsOptional()
  readonly departmentId?: string | null;

  @ApiProperty({
    example: 'https://example.com/avatar.jpg',
    description: 'Employee avatar URL',
    required: false,
  })
  @IsString()
  @IsOptional()
  readonly avatar?: string;
}
