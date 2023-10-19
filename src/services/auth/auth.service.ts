import { Injectable, UnauthorizedException } from '@nestjs/common';
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
    const accessToken = this.jwtService.sign({ ...payload });
    const refreshToken = this.jwtService.sign(
      { ...payload },
      { expiresIn: '7d' },
    );

    return { ...user, token: accessToken, refreshToken };
  }

  async verifyUserPassword(userSignInDto: UserSignInDto) {
    const { username, password } = userSignInDto;
    const user = await this.userRepository.findOne({ where: { username } });
    if (user && (await user.verifyPassword(password))) {
      return new UserResponseDto(user);
    }
    return;
  }

  async signUp(userSignUpDto: UserSignUpDto): Promise<UserResponseDto> {
    const salt = bcrypt.genSaltSync();
    const password = await bcrypt.hash(userSignUpDto.password, salt);
    const user = this.userRepository.create({
      ...userSignUpDto,
      salt,
      password,
    });
    const newUser = await this.userRepository.save(user);
    return new UserResponseDto(newUser);
  }

  async signAccessToken(refreshToken: string) {
    try {
      const payloadRefreshToken = this.jwtService.verify(refreshToken);
      const { exp, iat, ...payloadAccessToken } = payloadRefreshToken;
      const accessToken = this.jwtService.sign(payloadAccessToken, {
        expiresIn: '1h',
      });
      return { ...payloadAccessToken, token: accessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
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
}
