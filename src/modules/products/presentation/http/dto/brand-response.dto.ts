import { ApiProperty } from '@nestjs/swagger';

export class BrandResponseDto {
  @ApiProperty({ example: '0d6df463-6515-4201-a011-a52f65ad9583' })
  id!: string;

  @ApiProperty({ example: 'Lenovo' })
  name!: string;

  @ApiProperty({
    example: '2026-03-18T10:30:00Z',
    format: 'date-time',
  })
  createdAt!: string;
}
