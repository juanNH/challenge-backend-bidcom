import { ApiProperty } from '@nestjs/swagger';

export class StandardErrorDto {
  @ApiProperty({ example: 'Product not found' })
  error!: string;

  @ApiProperty({
    example: 'A0001',
    pattern: '^[A-Z][0-9]{4}$',
  })
  code!: string;

  @ApiProperty({
    example: 'b7c9f8d2-2e4c-4f0e-a123-9b12a6d4e8c3',
  })
  traceId!: string;
}
