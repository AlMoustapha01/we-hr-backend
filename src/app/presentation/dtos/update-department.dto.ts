import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, MinLength } from 'class-validator';

export class UpdateDepartmentDto {
  @ApiProperty({
    example: 'Engineering',
    description: 'Department name',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MinLength(2)
  readonly name?: string;

  @ApiProperty({
    example:
      'Responsible for software development and technical infrastructure',
    description: 'Department description',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MinLength(10)
  readonly description?: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description:
      'ID of the employee who will manage this department. Set to null to remove manager.',
    required: false,
    nullable: true,
  })
  @IsUUID()
  @IsOptional()
  readonly managerId?: string | null;
}
