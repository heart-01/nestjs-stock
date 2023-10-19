import { BaseEntity, Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, } from 'typeorm';

@Entity({ name: 'product' })
export class Product extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20, nullable: false })
  name: string;

  @Column({ nullable: true })
  image: string;

  @Column({ nullable: false })
  price: number;

  @Column({ nullable: false })
  stock: number;

  @CreateDateColumn({ name: 'created_at' })
  created: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;
}
