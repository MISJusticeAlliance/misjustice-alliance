import nodemailer, { Transporter } from 'nodemailer';
import { ENV } from './env';

let transporter: Transporter | null = null;

/**
 * Initialize email transporter
 */
export const initializeEmailService = (): Transporter => {
  if (transporter) {
    return transporter;
  }

  // Configure based on environment
  if (process.env.NODE_ENV === 'production') {
    // Production: Use SMTP with credentials from environment
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || 'notifications@misjusticealliance.org',
        pass: process.env.SMTP_PASSWORD,
      },
    });
  } else {
    // Development: Use test account
    transporter = nodemailer.createTransport({
      host: 'localhost',
      port: 1025, // MailHog default port
      secure: false,
    });
  }

  return transporter;
};

/**
 * Get email transporter instance
 */
export const getEmailTransporter = (): Transporter => {
  if (!transporter) {
    return initializeEmailService();
  }
  return transporter;
};

/**
 * Send email
 */
export const sendEmail = async (options: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}): Promise<boolean> => {
  try {
    const emailTransporter = getEmailTransporter();

    const result = await emailTransporter.sendMail({
      from: process.env.EMAIL_FROM || 'notifications@misjusticealliance.org',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo || 'support@misjusticealliance.org',
    });

    console.log('[Email] Sent successfully:', result.messageId);
    return true;
  } catch (error) {
    console.error('[Email] Failed to send:', error);
    return false;
  }
};

/**
 * Email templates
 */
export const emailTemplates = {
  /**
   * Case creation confirmation email
   */
  caseCreationConfirmation: (caseId: string, title: string, category: string, jurisdiction: string): string => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #003d7a; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
            .footer { background-color: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666; }
            .case-details { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #ffc107; }
            .case-id { font-size: 18px; font-weight: bold; color: #003d7a; margin: 10px 0; }
            .button { display: inline-block; background-color: #ffc107; color: #000; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
            .warning { background-color: #fff3cd; border: 1px solid #ffc107; padding: 10px; border-radius: 5px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>MISJustice Alliance</h1>
              <p>Case Submission Confirmation</p>
            </div>
            
            <div class="content">
              <p>Thank you for submitting your case to the MISJustice Alliance. We have received your submission and will review it carefully.</p>
              
              <div class="case-details">
                <h3>Your Case Details</h3>
                <div class="case-id">Case ID: ${caseId}</div>
                <p><strong>Title:</strong> ${title}</p>
                <p><strong>Category:</strong> ${category}</p>
                <p><strong>Jurisdiction:</strong> ${jurisdiction}</p>
              </div>
              
              <p><strong>Important:</strong> Please save your Case ID (${caseId}). You will need it to track your case and receive updates.</p>
              
              <div class="warning">
                <strong>⚠️ Privacy Notice:</strong> Your case has been submitted anonymously. We will not share your personal information with anyone without your explicit consent.
              </div>
              
              <p>You can track your case status at any time by visiting our website and using your Case ID.</p>
              
              <p>If you have any questions or need to provide additional information, please reply to this email or contact us through our website.</p>
              
              <p>Best regards,<br>The MISJustice Alliance Team</p>
            </div>
            
            <div class="footer">
              <p>&copy; 2024 MISJustice Alliance. All rights reserved.</p>
              <p>This email was sent to you because you submitted a case to our platform.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  },

  /**
   * Case update notification email
   */
  caseUpdateNotification: (caseId: string, title: string, updateTitle: string, updateContent: string): string => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #003d7a; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
            .footer { background-color: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666; }
            .update-box { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #28a745; }
            .case-id { font-size: 14px; color: #666; margin: 5px 0; }
            .update-title { font-size: 16px; font-weight: bold; color: #003d7a; margin: 10px 0; }
            .button { display: inline-block; background-color: #ffc107; color: #000; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>MISJustice Alliance</h1>
              <p>Case Update Notification</p>
            </div>
            
            <div class="content">
              <p>There is a new update on your case:</p>
              
              <div class="update-box">
                <div class="case-id">Case ID: ${caseId}</div>
                <p><strong>Case Title:</strong> ${title}</p>
                <div class="update-title">${updateTitle}</div>
                <p>${updateContent}</p>
              </div>
              
              <p>You can view the full details of your case and all updates on our website using your Case ID.</p>
              
              <p>If you have any questions about this update, please reply to this email or contact us through our website.</p>
              
              <p>Best regards,<br>The MISJustice Alliance Team</p>
            </div>
            
            <div class="footer">
              <p>&copy; 2024 MISJustice Alliance. All rights reserved.</p>
              <p>This email was sent to you because you have an active case with us.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  },

  /**
   * Password reset email
   */
  passwordReset: (resetLink: string, expiresIn: string = '24 hours'): string => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #003d7a; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
            .footer { background-color: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666; }
            .button-container { text-align: center; margin: 20px 0; }
            .button { display: inline-block; background-color: #ffc107; color: #000; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; }
            .warning { background-color: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 10px; border-radius: 5px; margin: 10px 0; }
            .link-text { word-break: break-all; font-size: 12px; color: #666; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>MISJustice Alliance</h1>
              <p>Password Reset Request</p>
            </div>
            
            <div class="content">
              <p>You have requested to reset your password for your MISJustice Alliance admin account.</p>
              
              <p>Click the button below to reset your password:</p>
              
              <div class="button-container">
                <a href="${resetLink}" class="button">Reset Password</a>
              </div>
              
              <p>Or copy and paste this link in your browser:</p>
              <div class="link-text">${resetLink}</div>
              
              <div class="warning">
                <strong>⚠️ Security Notice:</strong> This link will expire in ${expiresIn}. If you did not request this password reset, please ignore this email or contact us immediately.
              </div>
              
              <p>For security reasons, never share this link with anyone.</p>
              
              <p>Best regards,<br>The MISJustice Alliance Team</p>
            </div>
            
            <div class="footer">
              <p>&copy; 2024 MISJustice Alliance. All rights reserved.</p>
              <p>This email was sent to you because a password reset was requested for your account.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  },
};
