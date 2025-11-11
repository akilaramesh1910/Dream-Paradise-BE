import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';
import handlebars from 'handlebars';

interface EmailOptions {
  email: string;
  subject: string;
  template: string;
  data?: Record<string, any>;
}

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Compile email template
const compileTemplate = (templateName: string, data: Record<string, any>) => {
  const templatePath = path.join(__dirname, '../templates/emails', `${templateName}.hbs`);
  const source = fs.readFileSync(templatePath, 'utf8');
  const template = handlebars.compile(source);
  return template(data);
};

export const sendEmail = async ({ email, subject, template, data = {} }: EmailOptions) => {
  try {
    // Get HTML content
    const html = compileTemplate(template, data);

    // Send email
    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
      to: email,
      subject,
      html,
    });

    console.log('Email sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Email could not be sent');
  }
};