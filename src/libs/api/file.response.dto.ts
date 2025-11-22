import { ApiProperty } from '@nestjs/swagger';

export class FileResponse {
  @ApiProperty({
    description: 'File location or base64 content',
    example: 'https://storage.example.com/file.pdf or base64 encoded string',
  })
  readonly file: string;

  constructor(file: string) {
    this.file = file;
  }
}
