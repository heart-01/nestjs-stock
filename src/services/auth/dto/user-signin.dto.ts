import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsStrongPassword, MaxLength, MinLength, } from 'class-validator';

export class UserSignInDto {
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
