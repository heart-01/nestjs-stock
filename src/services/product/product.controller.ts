import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UploadedFile, UseGuards, UseInterceptors, } from '@nestjs/common';
import { ProductService } from './product.service';
import { Product } from './entities/product.entity';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiQuery, ApiTags, } from '@nestjs/swagger';
import { ProductCreateDto } from './dto/product-create.dto';
import { multerOptions } from 'src/config/multer.config';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductUpdateDto } from './dto/prodcut-update.dto';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Product')
@ApiBearerAuth('authorization')
@UseGuards(AuthGuard())
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @ApiQuery({ name: 'name', required: false })
  findAll(@Query('name') keyword: string): Promise<Product[]> {
    return this.productService.findAll(keyword);
  }

  @Get(':id')
  find(@Param('id') id: number): Promise<Product> {
    return this.productService.findOne(id);
  }

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: ProductCreateDto })
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() productCreateDto: ProductCreateDto,
  ): Promise<Product> {
    return this.productService.create(productCreateDto, file);
  }

  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: ProductCreateDto })
  @UseInterceptors(FileInterceptor('file', multerOptions))
  update(
    @Param('id') id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() productUpdateDto: ProductUpdateDto,
  ): Promise<Product> {
    return this.productService.update(id, productUpdateDto, file);
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    return this.productService.delete(id);
  }
}
