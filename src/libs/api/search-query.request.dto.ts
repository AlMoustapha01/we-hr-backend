import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SearchQueryRequestDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'comment',
    description: 'Filter by extraction comment',
    required: false,
  })
  search?: string;
}
