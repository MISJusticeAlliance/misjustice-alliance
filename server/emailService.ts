import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

// Initialize transporter - configure based on your email provider
let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    // Using environment variables for email configuration
    // Configure based on your email service (Gmail, SendGrid, AWS SES, etc.)
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: process.env.SMTP_USER && process.env.SMTP_PASSWORD ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      } : undefined,
    });
  }
  return transporter;
}

/**
 * Send contact form inquiry to staff
 */
export async function sendContactFormEmail(data: ContactFormData): Promise<boolean> {
  try {
    const transporter = getTransporter();

    // Email to staff
    const staffEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #003d7a; border-bottom: 3px solid #d4a574; padding-bottom: 10px;">
          New Contact Form Inquiry
        </h2>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Name:</strong> ${escapeHtml(data.name)}</p>
          <p><strong>Email:</strong> <a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></p>
          ${data.phone ? `<p><strong>Phone:</strong> ${escapeHtml(data.phone)}</p>` : ''}
          <p><strong>Subject:</strong> ${escapeHtml(data.subject)}</p>
        </div>

        <div style="margin: 20px 0;">
          <h3 style="color: #003d7a;">Message:</h3>
          <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #d4a574; white-space: pre-wrap;">
            ${escapeHtml(data.message)}
          </div>
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
          <p>This inquiry was submitted through the MISJustice Alliance Contact Form.</p>
          <p>Please respond to: <strong>${escapeHtml(data.email)}</strong></p>
        </div>
      </div>
    `;

    const staffEmailText = `
New Contact Form Inquiry

Name: ${data.name}
Email: ${data.email}
${data.phone ? `Phone: ${data.phone}` : ''}
Subject: ${data.subject}

Message:
${data.message}

---
This inquiry was submitted through the MISJustice Alliance Contact Form.
Please respond to: ${data.email}
    `;

    // Send email to staff
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@misjusticealliance.org',
      to: 'staff@misjusticealliance.org',
      subject: `[MISJustice Alliance] Contact Form: ${data.subject}`,
      html: staffEmailHtml,
      text: staffEmailText,
      replyTo: data.email,
    });

    // Send confirmation email to user
    const userEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #003d7a; border-bottom: 3px solid #d4a574; padding-bottom: 10px;">
          Thank You for Contacting MISJustice Alliance
        </h2>
        
        <p>Dear ${escapeHtml(data.name)},</p>

        <p>We have received your inquiry and appreciate you reaching out to us. Our team will review your message and get back to you as soon as possible.</p>

        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Your Inquiry Details:</strong></p>
          <p><strong>Subject:</strong> ${escapeHtml(data.subject)}</p>
          <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
        </div>

        <p>If your inquiry is urgent or requires immediate assistance, please contact us directly at our office.</p>

        <p style="margin-top: 30px;">
          Best regards,<br>
          <strong>MISJustice Alliance Team</strong><br>
          <em>Anonymous Legal Advocacy for Victims of Civil Rights Violations</em>
        </p>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
          <p>This is an automated confirmation email. Please do not reply to this message.</p>
        </div>
      </div>
    `;

    const userEmailText = `
Thank You for Contacting MISJustice Alliance

Dear ${data.name},

We have received your inquiry and appreciate you reaching out to us. Our team will review your message and get back to you as soon as possible.

Your Inquiry Details:
Subject: ${data.subject}
Submitted: ${new Date().toLocaleString()}

If your inquiry is urgent or requires immediate assistance, please contact us directly at our office.

Best regards,
MISJustice Alliance Team
Anonymous Legal Advocacy for Victims of Civil Rights Violations

---
This is an automated confirmation email. Please do not reply to this message.
    `;

    // Send confirmation to user
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@misjusticealliance.org',
      to: data.email,
      subject: 'Thank You for Contacting MISJustice Alliance',
      html: userEmailHtml,
      text: userEmailText,
    });

    return true;
  } catch (error) {
    console.error('Failed to send contact form email:', error);
    throw error;
  }
}

/**
 * Escape HTML special characters to prevent injection
 */
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
