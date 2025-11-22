import { ApiProperty } from '@nestjs/swagger';
import {
  EmployeeEntity,
  EmployeeStatus,
  EmployeePosition,
} from '@/app/domain/employee';

export class EmployeeResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Employee ID',
  })
  readonly id: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Employee full name',
  })
  readonly name: string;

  @ApiProperty({
    example: 'john.doe@company.com',
    description: 'Employee email address',
  })
  readonly email: string;

  @ApiProperty({
    example: '+1234567890',
    description: 'Employee phone number',
  })
  readonly phone: string;

  @ApiProperty({
    example: EmployeePosition.SENIOR,
    description: 'Employee position level',
    enum: EmployeePosition,
  })
  readonly position: EmployeePosition;

  @ApiProperty({
    example: 'Senior Software Engineer',
    description: 'Employee job role/title',
  })
  readonly role: string;

  @ApiProperty({
    example: EmployeeStatus.ACTIVE,
    description: 'Employee status',
    enum: EmployeeStatus,
  })
  readonly status: EmployeeStatus;

  @ApiProperty({
    example: '2024-01-15T00:00:00.000Z',
    description: 'Date when employee joined',
  })
  readonly joinDate: Date;

  @ApiProperty({
    example: 75000,
    description: 'Employee annual salary',
  })
  readonly salary: number;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Department ID',
    nullable: true,
  })
  readonly departmentId?: string;

  @ApiProperty({
    example: 'https://example.com/avatar.jpg',
    description: 'Employee avatar URL',
    nullable: true,
  })
  readonly avatar?: string;

  @ApiProperty({
    example: '2024-01-15T00:00:00.000Z',
    description: 'Creation timestamp',
  })
  readonly createdAt: Date;

  @ApiProperty({
    example: '2024-01-15T00:00:00.000Z',
    description: 'Last update timestamp',
  })
  readonly updatedAt: Date;

  static fromEntity(entity: EmployeeEntity): EmployeeResponseDto {
    const props = entity.getProps();
    return {
      id: props.id,
      name: props.name,
      email: props.email,
      phone: props.phone,
      position: props.position,
      role: props.role,
      status: props.status,
      joinDate: props.joinDate,
      salary: props.salary,
      departmentId: props.departmentId,
      avatar: props.avatar,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}
