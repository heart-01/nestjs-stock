import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UserSignUpDto {
  @ApiProperty({ example: 'John', description: 'The name of the user' })
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name: string;

  @ApiProperty({ example: 'John@email.com', description: 'The email of the user' })
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @MinLength(1)
  @MaxLength(70)
  email: string;

  @ApiProperty({ example: 'john1234', description: 'The username of the user' })
  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  username: string;

  @ApiProperty({ example: 'P@ssw0rd', description: 'The password of the user' })
  @IsNotEmpty()
  @IsStrongPassword()
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  password: string;
}
