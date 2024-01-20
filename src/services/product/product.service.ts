import { HttpException, HttpStatus, Injectable, NotFoundException, Res} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository, In } from 'typeorm';
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
    page: number = 0,
    limit: number = 10,
  ): Promise<{ data: Product[]; total: number; page: number; limit: number }> {
    let queryPromise: Promise<[Product[], number]>;
    let response: { data: Product[]; total: number; page: number; limit: number; }[] = [];

    if (keyword) {
      queryPromise = this.productRepository
        .createQueryBuilder('product')
        .andWhere('product.name LIKE :keyword', { keyword: `%${keyword}%` })
        .orderBy('product.id', 'ASC')
        .skip((page) * limit)
        .take(limit)
        .getManyAndCount();
    } else {
      queryPromise = this.productRepository.findAndCount({
        order: { id: 'ASC' },
        take: limit,
        skip: (page) * limit,
      });
    }

    const [products, total] = await queryPromise;

    // example response [data, total, page, limit]
    response.push({
      data: products,
      total,
      page,
      limit,
    });

    return {
      data: products,
      total,
      page,
      limit,
    };
  }

  async findOne(id: number): Promise<Product> {
    const found = await this.productRepository.findOne({
      where: { id },
    });
    if (!found) throw new NotFoundException(`Product id ${id} not found`);
    return found;
  }

  async findByIds(ids: number[]): Promise<Product[]> {
    if(isEmpty(ids)){
      throw new NotFoundException(`Product ids is required`);
    }
    const found = await this.productRepository.find({
      where: { id: In(ids) },
    });
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
    image: Express.Multer.File,
  ): Promise<Product> {
    try {
      const product = this.productRepository.create({
        ...productCreateDto,
        image: isEmpty(image) ? null : image.filename,
      });
      return await this.productRepository.save(product);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.CONFLICT);
    }
  }

  async update(
    id: number,
    productUpdateDto: ProductUpdateDto,
    image: Express.Multer.File,
  ): Promise<Product> {
    try {
      const product = await this.findOne(id);
      await this.productRepository.update(id, {
        ...productUpdateDto,
        image: isEmpty(image) ? product.image : image.filename,
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
