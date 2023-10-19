import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive, IsString, Max, MaxLength, Min, MinLength, } from 'class-validator';
import { Transform } from 'class-transformer';

export class ProductCreateDto {
  @ApiProperty({ example: 'name' })
  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  name: string;

  @ApiProperty({ required: false, type: 'string', format: 'binary' })
  file: any;

  @ApiProperty({ example: '100' })
  @IsNotEmpty()
  @Transform(({ value }) => +value)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message: 'Price must have a maximum of two decimal places.',
    },
  )
  @IsPositive()
  @Min(1)
  @Max(9999)
  price: number;

  @ApiProperty({ example: '10' })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 0 })
  @Transform(({ value }) => +value)
  @IsPositive()
  stock: number;
}
