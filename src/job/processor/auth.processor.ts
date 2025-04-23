import { InjectQueue, OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq'
import { Job } from 'bullmq'
import { AppLogger } from '../../system/logger/app.logger'
import { EmailService } from '../services/email.service'

export const AUTH_QUEUE = {
  NAME: 'auth',
  JOBS: {
    OTP_VERIFICATION: 'otp-verification',
  },
}
export const InjectAuthQueue = (): ParameterDecorator => InjectQueue(AUTH_QUEUE.NAME)

@Processor(AUTH_QUEUE.NAME, { concurrency: 3 })
export class AuthProcessor extends WorkerHost {
  constructor(
    private readonly logger: AppLogger,
    private readonly emailService: EmailService,
  ) {
    super()
  }

  async process(job: Job): Promise<any> {
    if (!job.data.token) return {}

    switch (job.name) {
      case AUTH_QUEUE.JOBS.OTP_VERIFICATION: {
        this.logger.debug('AUTH_EMAIL(' + job.name + ')', { data: job.data })
        const templatePath = './src/job/resources/email/auth-login-otp.html'
        const templateData = {
          ...job.data,
        }

        this.emailService.sendOtpEmail(
          job.data.email,
          'FlexRequest - Secure code - ' + job.data.token,
          templatePath,
          templateData,
        )
        break
      }
      default: {
        break
      }
    }

    return {}
  }

  @OnWorkerEvent('active')
  onActive(job: Job) {
    this.logger.info(job.name + '_ACTIVED', { id: job.id })
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.info(job.name + '_COMPLETED', { id: job.id })
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.info(job.name + '_FAILED', { id: job.id, reason: error.message })
  }
}