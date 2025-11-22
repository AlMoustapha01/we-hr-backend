import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty } from 'class-validator';

export class AssignManagerDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID of the employee to assign as manager',
  })
  @IsUUID()
  @IsNotEmpty()
  readonly employeeId: string;
}
