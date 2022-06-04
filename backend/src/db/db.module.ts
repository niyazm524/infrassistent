import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: 'localhost',
      port: 25432,
      username: 'postgres',
      password: 'strongpassword',
      database: 'infrassistent',
      synchronize: true,
      models: [],
    }),
  ],
})
export class DbModule {}
