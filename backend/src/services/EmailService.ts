import { injectable } from 'inversify';
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import type {
  IEmailService,
  OtpEmailPurpose,
  SendEmailOptions,
} from '../interface/IEmailService.js';
import { logger } from '../utils/logger.js';

@injectable()
export class EmailService implements IEmailService {
  private _transporter: Transporter | null = null;

  constructor() {
    this._initializeTransporter();
  }

  private _initializeTransporter(): void {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const user = process.env.SMTP_USER || process.env.EMAIL_USER;
    const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
    const service = process.env.EMAIL_SERVICE;

    if (!user || !pass) {
      logger.warn(
        'EmailService: SMTP credentials not set (EMAIL_USER/EMAIL_PASS). Emails will be logged to console instead of sent.'
      );
      return;
    }

    try {
      if (service) {
        this._transporter = nodemailer.createTransport({
          service,
          auth: { user, pass },
        });
      } else if (host) {
        this._transporter = nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          auth: { user, pass },
        });
      } else {
        // Default to Gmail service if user is provided without custom host
        this._transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: { user, pass },
        });
      }

      logger.info('EmailService: Transporter initialized successfully.');
    } catch (error) {
      logger.error(
        `EmailService: Failed to initialize transporter: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async sendMail(options: SendEmailOptions): Promise<boolean> {
    const fromAddress =
      process.env.EMAIL_FROM ||
      process.env.EMAIL_USER ||
      'no-reply@skillconnect.com';

    if (!this._transporter) {
      logger.info(
        `[MOCK EMAIL SENT] To: ${options.to} | Subject: "${options.subject}"`
      );
      if (options.text) {
        logger.debug(`[MOCK EMAIL TEXT]\n${options.text}`);
      }
      return true;
    }

    try {
      const info = await this._transporter.sendMail({
        from: fromAddress,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      logger.info(`Email sent to ${options.to}: messageId=${info.messageId}`);
      return true;
    } catch (error) {
      logger.error(
        `Email sending failed to ${options.to}: ${error instanceof Error ? error.message : String(error)}`
      );
      return false;
    }
  }

  async sendOtpEmail(
    to: string,
    otp: string,
    purpose: OtpEmailPurpose = 'verification'
  ): Promise<boolean> {
    const isReset = purpose === 'password-reset';
    const subject = isReset
      ? 'SkillConnect - Password Reset OTP Code'
      : 'SkillConnect - Email Verification OTP Code';

    const actionText = isReset
      ? 'reset your account password'
      : 'verify your email address';

    const validityMinutes = isReset ? '10' : '5';

    const textContent = `Hello,\n\nYour One-Time Password (OTP) to ${actionText} is: ${otp}\n\nThis code will expire in ${validityMinutes} minutes.\n\nIf you did not make this request, please ignore this email or contact support.\n\nBest regards,\nThe SkillConnect Team`;

    const htmlContent = this._buildOtpEmailHtml({
      otp,
      purpose,
      actionText,
      validityMinutes,
    });

    return await this.sendMail({
      to,
      subject,
      html: htmlContent,
      text: textContent,
    });
  }

  private _buildOtpEmailHtml(params: {
    otp: string;
    purpose: OtpEmailPurpose;
    actionText: string;
    validityMinutes: string;
  }): string {
    const isReset = params.purpose === 'password-reset';
    const accentColor = isReset ? '#ea580c' : '#2563eb';
    const badgeText = isReset ? 'Password Reset' : 'Account Verification';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SkillConnect OTP</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 18px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background-color: #0f172a; padding: 24px 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">
                Skill<span style="color: #38bdf8;">Connect</span>
              </h1>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px 30px;">
              <div style="display: inline-block; padding: 4px 12px; background-color: #f1f5f9; border-radius: 9999px; font-size: 12px; font-weight: 600; color: ${accentColor}; margin-bottom: 16px;">
                ${badgeText}
              </div>

              <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 600; color: #0f172a;">
                Your One-Time Password (OTP)
              </h2>

              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #475569;">
                Please use the following 6-digit verification code to ${params.actionText}:
              </p>

              <!-- OTP Box -->
              <div style="background-color: #f8fafc; border: 2px dashed ${accentColor}; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px;">
                <span style="font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #0f172a;">
                  ${params.otp}
                </span>
              </div>

              <p style="margin: 0 0 8px 0; font-size: 14px; color: #64748b;">
                ⏰ This code will expire in <strong>${params.validityMinutes} minutes</strong>.
              </p>
              <p style="margin: 0; font-size: 13px; color: #94a3b8; line-height: 1.5;">
                For your security, never share this code with anyone. SkillConnect will never ask for your code outside the app.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 30px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8;">
              <p style="margin: 0 0 4px 0;">
                If you did not request this OTP, you can safely ignore this email.
              </p>
              <p style="margin: 0;">
                &copy; ${new Date().getFullYear()} SkillConnect Platform. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }
}
