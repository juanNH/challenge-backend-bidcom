import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BrandResponseDto } from './brand-response.dto';
import { CategoryResponseDto } from './category-response.dto';

export class ProductResponseDto {
  @ApiProperty({ example: 'prod_123' })
  id!: string;

  @ApiProperty({ example: 'Laptop' })
  name!: string;

  @ApiPropertyOptional({ example: 'Laptop de 16GB RAM' })
  description?: string;

  @ApiProperty({ example: 1200.5 })
  price!: number;

  @ApiProperty({ example: 10 })
  stock!: number;

  @ApiProperty({ type: () => CategoryResponseDto })
  category!: CategoryResponseDto;

  @ApiProperty({ type: () => BrandResponseDto })
  brand!: BrandResponseDto;

  @ApiProperty({
    example: '2026-03-18T10:30:00Z',
    format: 'date-time',
  })
  createdAt!: string;
}
