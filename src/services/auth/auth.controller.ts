import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { UserResponseDto } from './dto/user-response.dto';
import { UserSignInDto } from './dto/user-signin.dto';
import { UserSignUpDto } from './dto/user-signup.dto';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Authorization')
@ApiBearerAuth('authorization')
@Controller('auth')
export class AuthController {
  constructor(private readonly authenService: AuthService) {}

  @Post('/signin')
  @ApiBody({ type: UserSignInDto })
  signIn(@Body() userSignInDto: UserSignInDto) {
    return this.authenService.signIn(userSignInDto);
  }

  @Post('/signup')
  signUp(@Body() userSignUpDto: UserSignUpDto): Promise<UserResponseDto> {
    return this.authenService.signUp(userSignUpDto);
  }

  @Post('/refreshToken')
  @UseGuards(AuthGuard())
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        refreshToken: { type: 'string', default: '' },
      },
    },
  })
  async refreshToken(@Body() token: { refreshToken: string }) {
    return this.authenService.signAccessToken(token.refreshToken);
  }
}
