import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
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
import { CreateProductUseCase } from '../../../application/use-cases/create-product.use-case';
import { DeleteProductUseCase } from '../../../application/use-cases/delete-product.use-case';
import { GetProductByIdUseCase } from '../../../application/use-cases/get-product-by-id.use-case';
import { GetProductsUseCase } from '../../../application/use-cases/get-products.use-case';
import { PatchProductUseCase } from '../../../application/use-cases/patch-product.use-case';
import { SearchProductsUseCase } from '../../../application/use-cases/search-products.use-case';
import { UpdateProductUseCase } from '../../../application/use-cases/update-product.use-case';
import { Product } from '../../../domain/entities/product.entity';
import { CreateProductDto } from '../dto/create-product.dto';
import { PatchProductDto } from '../dto/patch-product.dto';
import { ProductResponseDto } from '../dto/product-response.dto';
import { SearchProductsQueryDto } from '../dto/search-products-query.dto';
import { SearchProductsResponseDto } from '../dto/search-products-response.dto';
import { UpdateProductDto } from '../dto/update-product.dto';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly searchProductsUseCase: SearchProductsUseCase,
    private readonly getProductsUseCase: GetProductsUseCase,
    private readonly getProductByIdUseCase: GetProductByIdUseCase,
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly patchProductUseCase: PatchProductUseCase,
    private readonly deleteProductUseCase: DeleteProductUseCase,
  ) {}

  @Get('search')
  @ApiOperation({ summary: 'Buscar productos' })
  @ApiOkResponse({ type: SearchProductsResponseDto })
  @ApiBadRequestResponse({ type: StandardErrorDto })
  async searchProducts(
    @Query() query: SearchProductsQueryDto,
  ): Promise<SearchProductsResponseDto> {
    const result = await this.searchProductsUseCase.execute(query);

    return {
      total: result.total,
      items: result.items.map((product) => this.toProductResponse(product)),
    };
  }

  @Get()
  @ApiOperation({ summary: 'Obtener lista de productos' })
  @ApiOkResponse({ type: [ProductResponseDto] })
  async getProducts(): Promise<ProductResponseDto[]> {
    const products = await this.getProductsUseCase.execute();

    return products.map((product) => this.toProductResponse(product));
  }

  @Post()
  @ApiOperation({ summary: 'Crear un producto' })
  @ApiCreatedResponse({ type: ProductResponseDto })
  @ApiBadRequestResponse({ type: StandardErrorDto })
  async createProduct(
    @Body() body: CreateProductDto,
  ): Promise<ProductResponseDto> {
    const product = await this.executeProductCommand(() =>
      this.createProductUseCase.execute(body),
    );

    return this.toProductResponse(product);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un producto por ID' })
  @ApiOkResponse({ type: ProductResponseDto })
  @ApiNotFoundResponse({ type: StandardErrorDto })
  async getProductById(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<ProductResponseDto> {
    const product = await this.getProductByIdUseCase.execute(id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.toProductResponse(product);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Reemplazar un producto' })
  @ApiOkResponse({ type: ProductResponseDto })
  @ApiBadRequestResponse({ type: StandardErrorDto })
  @ApiNotFoundResponse({ type: StandardErrorDto })
  async updateProduct(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    const product = await this.executeProductCommand(() =>
      this.updateProductUseCase.execute({ id, ...body }),
    );

    return this.toProductResponse(product);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar parcialmente un producto' })
  @ApiOkResponse({ type: ProductResponseDto })
  @ApiBadRequestResponse({ type: StandardErrorDto })
  @ApiNotFoundResponse({ type: StandardErrorDto })
  async patchProduct(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: PatchProductDto,
  ): Promise<ProductResponseDto> {
    const product = await this.executeProductCommand(() =>
      this.patchProductUseCase.execute({ id, ...body }),
    );

    return this.toProductResponse(product);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un producto' })
  @ApiNoContentResponse({ description: 'Producto eliminado' })
  @ApiNotFoundResponse({ type: StandardErrorDto })
  async deleteProduct(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<void> {
    await this.executeVoidCommand(() => this.deleteProductUseCase.execute(id));
  }

  private async executeProductCommand(
    command: () => Promise<Product>,
  ): Promise<Product> {
    try {
      return await command();
    } catch (error) {
      this.throwHttpError(error);
    }
  }

  private async executeVoidCommand(
    command: () => Promise<void>,
  ): Promise<void> {
    try {
      await command();
    } catch (error) {
      this.throwHttpError(error);
    }
  }

  private throwHttpError(error: unknown): never {
    if (error instanceof Error && error.message === 'Product not found') {
      throw new NotFoundException(error.message);
    }

    if (
      error instanceof Error &&
      (error.message === 'Category not found' ||
        error.message === 'Brand not found')
    ) {
      throw new BadRequestException(error.message);
    }

    throw error;
  }

  private toProductResponse(product: Product): ProductResponseDto {
    return {
      id: product.id,
      name: product.name,
      description: product.description ?? undefined,
      price: product.price,
      stock: product.stock,
      category: {
        id: product.category.id,
        name: product.category.name,
        createdAt: product.category.createdAt.toISOString(),
      },
      brand: {
        id: product.brand.id,
        name: product.brand.name,
        createdAt: product.brand.createdAt.toISOString(),
      },
      createdAt: product.createdAt.toISOString(),
    };
  }
}
