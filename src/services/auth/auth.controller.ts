import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { UserResponseDto } from './dto/user-response.dto';
import { UserSignInDto } from './dto/user-signin.dto';
import { UserSignUpDto } from './dto/user-signup.dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from './entities/user.entity';

@ApiTags('Authorization')
@ApiBearerAuth('authorization')
@Controller()
export class AuthController {
  constructor(private readonly authenService: AuthService) {}

  @Post('auth/signin')
  @ApiBody({ type: UserSignInDto })
  signIn(@Body() userSignInDto: UserSignInDto) {
    return this.authenService.signIn(userSignInDto);
  }

  @Post('auth/signup')
  signUp(@Body() userSignUpDto: UserSignUpDto) {
    return this.authenService.signUp(userSignUpDto);
  }

  @Post('auth/refreshToken')
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
    return this.authenService.handleRefreshToken(token.refreshToken);
  }

  @Get('user')
  @UseGuards(AuthGuard())
  @ApiQuery({ name: 'name', required: false })
  findAll(@Query('name') keyword: string): Promise<User[]> {
    return this.authenService.findAll(keyword);
  }

  @Get('profile')
  @UseGuards(AuthGuard())
  findProfile(@Req() req) {
    const accessToken = req.headers.authorization.split(' ')[1];
    return this.authenService.findProfile(accessToken);
  }
}
