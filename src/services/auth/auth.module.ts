import { Module } from '@nestjs/common';
import { User } from './entities/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthJwtStrategy } from './auth.jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: async () => ({
        secretOrPrivateKey: process.env.JWT_SECRETY_KEY,
        signOptions: {
          expiresIn: process.env.JWT_EXPIRES_IN,
        },
      }),
    }),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthJwtStrategy],
  exports: [AuthJwtStrategy, PassportModule],
})
export class AuthModule {}
