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
import { ParseQueryArrayValuePipe } from 'src/pipes/parse-query-array-value-pipes';

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
  findOne(@Param('id') id: number): Promise<Product> {
    return this.productService.findOne(id);
  }

  // 'query/multiple?ids=1&ids=2&ids=3' or 'query/multiple?ids=[1,2,3]'
  @Get('query/multiple')
  findByIds(
    @Query('ids', new ParseQueryArrayValuePipe()) ids: number[],
  ): Promise<Product[]> {
    return this.productService.findByIds(ids);
  }

  @Get('image/:file')
  getImage(@Param('file') fileName: string, @Res() res: Response) {
    return this.productService.getImageProduct(fileName, res);
  }

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: ProductCreateDto })
  @UseInterceptors(FileInterceptor('image', multerOptions('product')))
  async create(
    @UploadedFile() image: Express.Multer.File,
    @Body() productCreateDto: ProductCreateDto,
  ): Promise<Product> {
    return this.productService.create(productCreateDto, image);
  }

  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: ProductCreateDto })
  @UseInterceptors(FileInterceptor('image', multerOptions('product')))
  update(
    @Param('id') id: number,
    @UploadedFile() image: Express.Multer.File,
    @Body() productUpdateDto: ProductUpdateDto,
  ): Promise<Product> {
    return this.productService.update(id, productUpdateDto, image);
  }

  @Delete(':id')
  async delete(@Param('id') id: number): Promise<Product> {
    return this.productService.delete(id);
  }
}
