import { ProductModule } from './services/product/product.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './services/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseConfiguration } from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfiguration,
    }),
    AuthModule,
    ProductModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
