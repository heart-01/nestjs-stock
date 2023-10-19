import { HttpException, HttpStatus, Injectable, NotFoundException, } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { ProductCreateDto } from './dto/product-create.dto';
import { ProductUpdateDto } from './dto/prodcut-update.dto';
import { isEmpty } from 'lodash';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async findAll(keyword?: string): Promise<Product[]> {
    let found = [];
    if (keyword) {
      found = await this.productRepository
        .createQueryBuilder('product')
        .andWhere('product.name LIKE :keyword', {
          keyword: `%${keyword}%`,
        })
        .getMany();
    } else {
      found = await this.productRepository.find();
    }

    return found;
  }

  async findOne(id: number): Promise<Product> {
    const found = await this.productRepository.findOne({
      where: { id },
    });
    if (!found) throw new NotFoundException(`Product id ${id} not found`);
    return found;
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

  async delete(id: number): Promise<Product[]> {
    const product = await this.findOne(id);
    product.deletedAt = new Date();
    await this.productRepository.save(product);
    return await this.findAll();
  }
}
