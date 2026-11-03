export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export type OtpEmailPurpose = 'verification' | 'password-reset';

export interface IEmailService {
  sendMail(options: SendEmailOptions): Promise<boolean>;
  sendOtpEmail(
    to: string,
    otp: string,
    purpose?: OtpEmailPurpose
  ): Promise<boolean>;
}
