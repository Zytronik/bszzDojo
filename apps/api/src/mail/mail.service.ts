import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_NAME } from '@bszz-dojo/shared';
import { createTransport, type Transporter } from 'nodemailer';

export interface Mail {
  to: string;
  subject: string;
  text: string;
}

/** Sends over `SMTP_URL`; without it (local dev) mails are logged instead. */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transport: Transporter | null;
  private readonly from: string;

  constructor(config: ConfigService) {
    const smtpUrl = config.get<string>('SMTP_URL');
    this.transport = smtpUrl ? createTransport(smtpUrl) : null;
    this.from = config.get<string>('MAIL_FROM') ?? APP_NAME;
  }

  async send(mail: Mail): Promise<void> {
    if (this.transport === null) {
      this.logger.log(
        `SMTP_URL not set, not sending to ${mail.to}:\n${mail.subject}\n\n${mail.text}`,
      );
      return;
    }
    await this.transport.sendMail({ from: this.from, ...mail });
  }
}
