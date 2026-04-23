import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Laptop' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ example: 'Laptop de 16GB RAM' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 1200.5 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price!: number;

  @ApiPropertyOptional({ example: 10, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  @ApiProperty({ example: 'cbf64f0a-9cef-4ae1-a5aa-1206a8e02f9a' })
  @IsUUID()
  categoryId!: string;

  @ApiProperty({ example: '0d6df463-6515-4201-a011-a52f65ad9583' })
  @IsUUID()
  brandId!: string;
}
