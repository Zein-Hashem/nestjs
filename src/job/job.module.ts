import { Module } from '@nestjs/common'
import { AUTH_QUEUE, AuthProcessor } from './processor/auth.processor'
import { BullModule } from '@nestjs/bullmq'
import { config } from './../config'
import { EmailService } from './services/email.service'

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: config.redis.host,
        port: Number(config.redis.port),
      },
    }),
    BullModule.registerQueue(
      {
        name: AUTH_QUEUE.NAME,
      },
      
    ),
  ],
  providers: [EmailService, AuthProcessor],
  exports: [BullModule],
})
export class JobModule {}