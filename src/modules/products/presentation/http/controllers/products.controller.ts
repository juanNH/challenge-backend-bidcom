import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotImplementedException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { StandardErrorDto } from '../../../../../shared/presentation/http/dto/standard-error.dto';
import { CreateProductDto } from '../dto/create-product.dto';
import { PatchProductDto } from '../dto/patch-product.dto';
import { ProductResponseDto } from '../dto/product-response.dto';
import { SearchProductsQueryDto } from '../dto/search-products-query.dto';
import { SearchProductsResponseDto } from '../dto/search-products-response.dto';
import { UpdateProductDto } from '../dto/update-product.dto';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  @Get('search')
  @ApiOperation({ summary: 'Buscar productos' })
  @ApiOkResponse({ type: SearchProductsResponseDto })
  @ApiBadRequestResponse({ type: StandardErrorDto })
  searchProducts(@Query() query: SearchProductsQueryDto): never {
    void query;
    throw new NotImplementedException('Pending TDD implementation');
  }

  @Get()
  @ApiOperation({ summary: 'Obtener lista de productos' })
  @ApiOkResponse({ type: [ProductResponseDto] })
  getProducts(): never {
    throw new NotImplementedException('Pending TDD implementation');
  }

  @Post()
  @ApiOperation({ summary: 'Crear un producto' })
  @ApiCreatedResponse({ type: ProductResponseDto })
  @ApiBadRequestResponse({ type: StandardErrorDto })
  createProduct(@Body() body: CreateProductDto): never {
    void body;
    throw new NotImplementedException('Pending TDD implementation');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un producto por ID' })
  @ApiOkResponse({ type: ProductResponseDto })
  @ApiNotFoundResponse({ type: StandardErrorDto })
  getProductById(@Param('id', new ParseUUIDPipe()) id: string): never {
    void id;
    throw new NotImplementedException('Pending TDD implementation');
  }

  @Put(':id')
  @ApiOperation({ summary: 'Reemplazar un producto' })
  @ApiOkResponse({ type: ProductResponseDto })
  @ApiBadRequestResponse({ type: StandardErrorDto })
  @ApiNotFoundResponse({ type: StandardErrorDto })
  updateProduct(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: UpdateProductDto,
  ): never {
    void id;
    void body;
    throw new NotImplementedException('Pending TDD implementation');
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar parcialmente un producto' })
  @ApiOkResponse({ type: ProductResponseDto })
  @ApiBadRequestResponse({ type: StandardErrorDto })
  @ApiNotFoundResponse({ type: StandardErrorDto })
  patchProduct(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: PatchProductDto,
  ): never {
    void id;
    void body;
    throw new NotImplementedException('Pending TDD implementation');
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un producto' })
  @ApiNoContentResponse({ description: 'Producto eliminado' })
  @ApiNotFoundResponse({ type: StandardErrorDto })
  deleteProduct(@Param('id', new ParseUUIDPipe()) id: string): never {
    void id;
    throw new NotImplementedException('Pending TDD implementation');
  }
}
