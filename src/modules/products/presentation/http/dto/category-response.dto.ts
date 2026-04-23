import { ApiProperty } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty({ example: 'cbf64f0a-9cef-4ae1-a5aa-1206a8e02f9a' })
  id!: string;

  @ApiProperty({ example: 'Electronics' })
  name!: string;

  @ApiProperty({
    example: '2026-03-18T10:30:00Z',
    format: 'date-time',
  })
  createdAt!: string;
}
