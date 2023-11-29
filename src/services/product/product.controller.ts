import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Res, UploadedFile, UseGuards, UseInterceptors, } from '@nestjs/common';
import { ProductService } from './product.service';
import { Product } from './entities/product.entity';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiQuery, ApiTags, } from '@nestjs/swagger';
import { ProductCreateDto } from './dto/product-create.dto';
import { multerOptions } from 'src/config/multer.config';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductUpdateDto } from './dto/prodcut-update.dto';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';

@ApiTags('Product')
@ApiBearerAuth('authorization')
@UseGuards(AuthGuard())
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @ApiQuery({ name: 'name', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findAll(
    @Query('name') keyword: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ): Promise<{ data: Product[]; total: number; page: number; limit: number }> {
    return this.productService.findAll(keyword, page, limit);
  }

  @Get(':id')
  find(@Param('id') id: number): Promise<Product> {
    return this.productService.findOne(id);
  }

  @Get('image/:file')
  getImage(@Param('file') fileName: string, @Res() res: Response) {
    return this.productService.getImageProduct(fileName, res);
  }

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: ProductCreateDto })
  @UseInterceptors(FileInterceptor('file', multerOptions('product')))
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() productCreateDto: ProductCreateDto,
  ): Promise<Product> {
    return this.productService.create(productCreateDto, file);
  }

  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: ProductCreateDto })
  @UseInterceptors(FileInterceptor('file', multerOptions('product')))
  update(
    @Param('id') id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() productUpdateDto: ProductUpdateDto,
  ): Promise<Product> {
    return this.productService.update(id, productUpdateDto, file);
  }

  @Delete(':id')
  async delete(@Param('id') id: number): Promise<Product> {
    return this.productService.delete(id);
  }
}
