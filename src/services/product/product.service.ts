import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  Res,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { ProductCreateDto } from './dto/product-create.dto';
import { ProductUpdateDto } from './dto/prodcut-update.dto';
import { isEmpty } from 'lodash';
import * as fs from 'fs';
import { Response } from 'express';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async findAll(
    keyword?: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: Product[]; total: number; page: number; limit: number }[]> {
    let queryPromise: Promise<[Product[], number]>;
    let response: { data: Product[]; total: number; page: number; limit: number; }[] = [];

    if (keyword) {
      queryPromise = this.productRepository
        .createQueryBuilder('product')
        .andWhere('product.name LIKE :keyword', { keyword: `%${keyword}%` })
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();
    } else {
      queryPromise = this.productRepository.findAndCount({
        take: limit,
        skip: (page - 1) * limit,
      });
    }

    const [products, total] = await queryPromise;
    response.push({
      data: products,
      total,
      page,
      limit,
    });

    return response;
  }

  async findOne(id: number): Promise<Product> {
    const found = await this.productRepository.findOne({
      where: { id },
    });
    if (!found) throw new NotFoundException(`Product id ${id} not found`);
    return found;
  }

  getImageProduct(fileName: string, @Res() res: Response) {
    const imagePath = `src/assets/uploads/product/${fileName}`;
    if (fs.existsSync(imagePath)) {
      res.setHeader('Content-Type', 'image/png');
      const imageProduct = fs.createReadStream(imagePath).pipe(res);
      return imageProduct;
    } else {
      throw new NotFoundException(`Image product ${fileName} not found`);
    }
  }

  async create(
    productCreateDto: ProductCreateDto,
    file: Express.Multer.File,
  ): Promise<Product> {
    try {
      const product = this.productRepository.create({
        ...productCreateDto,
        image: isEmpty(file) ? null : file.filename,
      });
      return await this.productRepository.save(product);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.CONFLICT);
    }
  }

  async update(
    id: number,
    productUpdateDto: ProductUpdateDto,
    file: Express.Multer.File,
  ): Promise<Product> {
    try {
      const product = await this.findOne(id);
      await this.productRepository.update(id, {
        ...productUpdateDto,
        image: isEmpty(file) ? product.image : file.filename,
      });
      return await this.findOne(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.CONFLICT);
    }
  }

  async delete(id: number): Promise<Product> {
    const product = await this.findOne(id);
    product.deletedAt = new Date();
    await this.productRepository.save(product);
    return product;
  }
}
