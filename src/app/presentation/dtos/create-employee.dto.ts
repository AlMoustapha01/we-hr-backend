import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsEnum,
  IsNumber,
  IsPositive,
  IsOptional,
  IsUUID,
  IsDateString,
  MinLength,
} from 'class-validator';
import { EmployeePosition } from '@/app/domain/employee';

export class CreateEmployeeDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'Employee full name',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  readonly name: string;

  @ApiProperty({
    example: 'john.doe@company.com',
    description: 'Employee email address',
  })
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @ApiProperty({
    example: '+1234567890',
    description: 'Employee phone number',
  })
  @IsString()
  @IsNotEmpty()
  readonly phone: string;

  @ApiProperty({
    example: EmployeePosition.SENIOR,
    description: 'Employee position level',
    enum: EmployeePosition,
  })
  @IsEnum(EmployeePosition)
  @IsNotEmpty()
  readonly position: EmployeePosition;

  @ApiProperty({
    example: 'Senior Software Engineer',
    description: 'Employee job role/title',
  })
  @IsString()
  @IsNotEmpty()
  readonly role: string;

  @ApiProperty({
    example: '2024-01-15T00:00:00.000Z',
    description: 'Date when employee joined the company',
  })
  @IsDateString()
  @IsNotEmpty()
  readonly joinDate: string;

  @ApiProperty({
    example: 75000,
    description: 'Employee annual salary',
  })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  readonly salary: number;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Department ID (optional)',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  readonly departmentId?: string;

  @ApiProperty({
    example: 'https://example.com/avatar.jpg',
    description: 'Employee avatar URL (optional)',
    required: false,
  })
  @IsString()
  @IsOptional()
  readonly avatar?: string;
}
