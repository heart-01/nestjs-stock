import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from './entities/user.entity';
import { UserSignInDto } from './dto/user-signin.dto';
import { UserSignUpDto } from './dto/user-signup.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserResponseDto } from './dto/user-response.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(userSignInDto: UserSignInDto) {
    const user = await this.verifyUserPassword(userSignInDto);

    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const { ...payload } = user;
    const token = this.signAccessToken(payload);
    const refreshToken = this.signRefreshToken(payload);

    return { ...user, token, refreshToken };
  }

  async verifyUserPassword(userSignInDto: UserSignInDto) {
    const { username, password } = userSignInDto;
    const user = await this.userRepository.findOne({ where: { username } });
    if (user && (await user.verifyPassword(password))) {
      return new UserResponseDto(user);
    }
    return;
  }

  async signUp(userSignUpDto: UserSignUpDto) {
    const salt = bcrypt.genSaltSync();
    const password = await bcrypt.hash(userSignUpDto.password, salt);
    try {
      const user = this.userRepository.create({
        ...userSignUpDto,
        salt,
        password,
      });
      const newUser = new UserResponseDto(await this.userRepository.save(user));
      const token = this.signAccessToken(newUser);
      const refreshToken = this.signRefreshToken(newUser);

      return { ...newUser, token, refreshToken };
    } catch (error) {
      throw new ConflictException(error.message);
    }
  }

  async handleRefreshToken(tokenRefresh: string) {
    try {
      const payloadRefreshToken = this.jwtService.verify(tokenRefresh);
      const { exp, iat, ...payloadAccessToken } = payloadRefreshToken;
      const accessToken = this.signAccessToken(payloadAccessToken);
      const refreshToken = this.signRefreshToken(payloadAccessToken);
      return { ...payloadAccessToken, token: accessToken, refreshToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  signAccessToken(payload: UserResponseDto) {
    return this.jwtService.sign({ ...payload }, { expiresIn: '1h' });
  }

  signRefreshToken(payload: UserResponseDto) {
    return this.jwtService.sign({ ...payload }, { expiresIn: '7d' });
  }

  async findAll(keyword?: string): Promise<User[]> {
    let found = [];
    if (keyword) {
      found = await this.userRepository
        .createQueryBuilder('user')
        .andWhere('user.username LIKE :keyword', {
          keyword: `%${keyword}%`,
        })
        .getMany();
    } else {
      found = await this.userRepository.find();
    }

    return found;
  }

  async findProfile(accessToken: string) {
    const payloadAccessToken = this.jwtService.verify(accessToken);
    const found = await this.userRepository.findOne({ where: { username: payloadAccessToken.username } });
    const user = new UserResponseDto(found);

    return { ...user, token: accessToken };
  }
}
