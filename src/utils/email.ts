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

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },

  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

// Compile email template
const compileTemplate = (
  templateName: string,
  data: Record<string, any>
) => {
  const templatePath = path.join(
    __dirname,
    '../templates/emails',
    `${templateName}.hbs`
  );

  const source = fs.readFileSync(templatePath, 'utf8');

  const template = handlebars.compile(source);

  return template(data);
};

export const sendEmail = async (options: EmailOptions) => {
  try {
    console.log('===== sendEmail CALLED =====');

    // Compile template HTML
    const html = compileTemplate(
      options.template,
      options.data || {}
    );

    const mailOptions = {
      from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
      to: options.email,
      subject: options.subject,
      html,
    };

    console.log('Sending mail to:', options.email);

    const info = await transporter.sendMail(mailOptions);

    console.log('===== MAIL SENT SUCCESS =====');
    console.log(info);

    return info;

  } catch (error: any) {
    console.log('===== EMAIL ERROR =====');
    console.log(error);
    console.log('Error Message:', error.message);

    throw error;
  }
};