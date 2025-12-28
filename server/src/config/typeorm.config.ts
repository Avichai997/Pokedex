import { TypeOrmModuleOptions } from '@nestjs/typeorm';

import { config } from './config';
import { User } from '@/users/entities';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.name,
  entities: [User],
  synchronize: config.server.nodeEnv !== 'production',
  logging: config.server.nodeEnv === 'development',
};
