import { Strategy, ExtractJwt } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

export class AuthJwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRETY_KEY,
    });
  }

  async validate(payload: { username: string }) {
    const { username } = payload;
    const user = await this.userRepository.findOne({ where: { username } });

    if (!user) {
      throw new UnauthorizedException();
    }

    return {
      name: user.name,
      username: user.username,
      email: user.email,
    };
  }
}
