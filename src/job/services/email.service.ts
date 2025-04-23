import { Injectable } from '@nestjs/common'
import * as SibApiV3Sdk from 'sib-api-v3-sdk'
import * as fs from 'fs'
import * as path from 'path'
import * as Handlebars from 'handlebars'
import { config } from '../../config'

@Injectable()
export class EmailService {
  private apiInstance: SibApiV3Sdk.TransactionalEmailsApi

  constructor() {
    const apiKey = config.mail.apiKey
    if (!apiKey) {
      throw new Error('apiKey is not defined in the configuration')
    }
    SibApiV3Sdk.ApiClient.instance.authentications['api-key'].apiKey = apiKey
    this.apiInstance = new SibApiV3Sdk.TransactionalEmailsApi()
  }

  private async generateHtmlFromTemplate(templatePath: string, templateData: any): Promise<string> {
    try {
      const templateContent = await fs.promises.readFile(path.resolve(templatePath), 'utf8')
      const template = Handlebars.compile(templateContent)
      return template(templateData)
    } catch (error) {
      console.error('Error generating HTML from template:', error)
      throw new Error('Failed to generate email content')
    }
  }

  async sendOtpEmail(
    to: string,
    subject: string,
    templatePath: string,
    templateData: any,
  ): Promise<void> {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail()

    sendSmtpEmail.sender = {
      email: config.mail.senderEmail,
      name: config.mail.senderName,
    }

    sendSmtpEmail.to = [{ email: to }]
    sendSmtpEmail.subject = subject
    sendSmtpEmail.htmlContent = await this.generateHtmlFromTemplate(templatePath, templateData)

    try {
      await this.apiInstance.sendTransacEmail(sendSmtpEmail)
    } catch (error) {
      console.error('Error sending email:', error)
      throw new Error('Failed to send email')
    }
  }

  async sendInvitationEmail(
    to: string,
    subject: string,
    templatePath: string,
    templateData: any,
  ): Promise<void> {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail()
    sendSmtpEmail.sender = {
      email: config.mail.senderEmail,
      name: config.mail.senderName,
    }
    sendSmtpEmail.to = [{ email: to }]
    sendSmtpEmail.subject = subject
    sendSmtpEmail.htmlContent = await this.generateHtmlFromTemplate(templatePath, templateData)

    try {
      await this.apiInstance.sendTransacEmail(sendSmtpEmail)
    } catch (error) {
      console.error('Error sending email:', error)
      throw new Error('Failed to send email')
    }
  }
}