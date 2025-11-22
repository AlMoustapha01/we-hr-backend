import { ApiProperty } from '@nestjs/swagger';
import { EmployeeAssignmentEntity } from '@/app/domain/employee-assignment';

export class EmployeeAssignmentResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Assignment ID',
  })
  readonly id: string;

  @ApiProperty({
    example: '660e8400-e29b-41d4-a716-446655440001',
    description: 'Employee ID',
  })
  readonly employeeId: string;

  @ApiProperty({
    example: '770e8400-e29b-41d4-a716-446655440002',
    description: 'Department ID',
  })
  readonly departmentId: string;

  @ApiProperty({
    example: '2024-01-15T00:00:00.000Z',
    description: 'Assignment date',
  })
  readonly assignedAt: Date;

  @ApiProperty({
    example: null,
    description: 'Unassignment date',
    nullable: true,
  })
  readonly unassignedAt: Date | null;

  @ApiProperty({
    example: true,
    description: 'Whether the assignment is active',
  })
  readonly isActive: boolean;

  @ApiProperty({
    example: 'Assigned to lead the new project',
    description: 'Assignment notes',
    nullable: true,
  })
  readonly notes: string | null;

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

  static fromEntity(
    entity: EmployeeAssignmentEntity,
  ): EmployeeAssignmentResponseDto {
    const props = entity.getProps();
    return {
      id: entity.id,
      employeeId: props.employeeId,
      departmentId: props.departmentId,
      assignedAt: props.assignedAt,
      unassignedAt: props.unassignedAt,
      isActive: props.isActive,
      notes: props.notes,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
