import { DataSource } from 'typeorm';

import { config } from './config';
import { User } from '@/users/entities';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.name,
  entities: [User],
  migrations: [
    config.server.nodeEnv === 'production' ? 'dist/migrations/*.js' : 'src/migrations/*.ts',
  ],
  synchronize: false,
  logging: config.server.nodeEnv === 'development',
});
