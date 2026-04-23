import { ApiProperty } from '@nestjs/swagger';
import { ProductResponseDto } from './product-response.dto';

export class SearchProductsResponseDto {
  @ApiProperty({ example: 120 })
  total!: number;

  @ApiProperty({ type: ProductResponseDto, isArray: true })
  items!: ProductResponseDto[];
}
