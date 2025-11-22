import { ApiProperty } from '@nestjs/swagger';

export class ApiErrorResponse {
  @ApiProperty({ example: 400 })
  readonly statusCode: number;

  @ApiProperty({ example: 'Validation Error' })
  readonly message: string;

  @ApiProperty({ example: 'Bad Request' })
  readonly error: string;

  @ApiProperty({ example: 'YevPQs' })
  readonly correlationId: string;

  @ApiProperty({
    example: ['incorrect email'],
    description: 'Optional list of sub-errors',
    nullable: true,
    required: false,
  })
  readonly subErrors?: string[];

  @ApiProperty({ example: '127.0.0.1' })
  readonly ip?: string;

  @ApiProperty({ example: '127.0.0.1' })
  readonly instanceName?: string;

  @ApiProperty({ example: '127.0.0.1' })
  readonly appName?: string;

  constructor(body: ApiErrorResponse) {
    this.statusCode = body.statusCode;
    this.message = body.message;
    this.error = body.error;
    this.correlationId = body.correlationId;
    this.subErrors = body.subErrors;
    this.ip = body.ip;
    this.instanceName = body.instanceName;
    this.appName = body.appName;
  }
}
