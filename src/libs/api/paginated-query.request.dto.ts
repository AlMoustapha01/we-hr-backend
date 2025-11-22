import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { SearchQueryRequestDto } from './search-query.request.dto';

export class PaginatedQueryRequestDto extends SearchQueryRequestDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(99999)
  @Type(() => Number)
  @ApiProperty({
    example: 10,
    description: 'Specifies a limit of returned records',
    required: false,
  })
  readonly limit?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(99999)
  @Type(() => Number)
  @ApiProperty({ example: 1, description: 'Page number', required: false })
  readonly page?: number;
}
