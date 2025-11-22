import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsString } from 'class-validator';

export class AssignEmployeeToDepartmentDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID of the employee to assign',
  })
  @IsUUID()
  readonly employeeId: string;

  @ApiProperty({
    example: '660e8400-e29b-41d4-a716-446655440001',
    description: 'ID of the department',
  })
  @IsUUID()
  readonly departmentId: string;

  @ApiProperty({
    example: 'Assigned to lead the new project',
    description: 'Optional notes about the assignment',
    required: false,
  })
  @IsString()
  @IsOptional()
  readonly notes?: string;
}
