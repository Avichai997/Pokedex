import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from '@/app.controller';
import { AuthModule } from '@/auth';
import { typeOrmConfig } from '@/config';
import { UsersModule } from '@/users';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(typeOrmConfig),
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
