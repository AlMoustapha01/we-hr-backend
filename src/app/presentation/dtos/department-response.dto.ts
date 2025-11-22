import { ApiProperty } from '@nestjs/swagger';
import { DepartmentEntity } from '@/app/domain/department';

export class DepartmentResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Department ID',
  })
  readonly id: string;

  @ApiProperty({
    example: 'Engineering',
    description: 'Department name',
  })
  readonly name: string;

  @ApiProperty({
    example: 'engineering',
    description: 'Department slug',
  })
  readonly slug: string;

  @ApiProperty({
    example:
      'Responsible for software development and technical infrastructure',
    description: 'Department description',
  })
  readonly description: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Manager employee ID',
    nullable: true,
    required: false,
  })
  readonly managerId: string | null;

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

  static fromEntity(entity: DepartmentEntity): DepartmentResponseDto {
    const props = entity.getProps();
    return {
      id: props.id,
      name: props.name,
      slug: props.slug,
      description: props.description,
      managerId: props.managerId,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}
