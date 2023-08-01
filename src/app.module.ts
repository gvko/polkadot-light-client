import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientModule } from './client/client.module';
import { ConfigModule } from '@nestjs/config';
import { config } from './common/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
    }),
    ClientModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
}
