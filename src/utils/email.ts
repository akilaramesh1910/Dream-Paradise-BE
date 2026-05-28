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

// Log SMTP Configuration on initialization
console.log('===== SMTP CONFIGURATION LOADING =====');
console.log('ENV SMTP_HOST:', process.env.SMTP_HOST);
console.log('ENV SMTP_PORT:', process.env.SMTP_PORT);
console.log('ENV SMTP_USER:', process.env.SMTP_USER);
console.log('ENV SMTP_PASS Length:', process.env.SMTP_PASS ? process.env.SMTP_PASS.length : 0);
console.log('ENV SMTP_FROM_NAME:', process.env.SMTP_FROM_NAME);
console.log('ENV SMTP_FROM_EMAIL:', process.env.SMTP_FROM_EMAIL);

const mailConfig: any = {
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
};

if (process.env.SMTP_HOST && process.env.SMTP_HOST.includes('gmail')) {
  console.log('Setting up Nodemailer using built-in "gmail" service config');
  mailConfig.service = 'gmail';
} else {
  console.log('Setting up Nodemailer using custom host and port');
  mailConfig.host = process.env.SMTP_HOST;
  mailConfig.port = parseInt(process.env.SMTP_PORT || '587');
  mailConfig.secure = mailConfig.port === 465;
}

console.log('Final Mail Config (excluding auth.pass):', {
  ...mailConfig,
  auth: {
    user: mailConfig.auth.user,
    pass: mailConfig.auth.pass ? '******' : undefined
  }
});

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.log('===== SMTP CONNECTION VERIFICATION FAILED =====');
    console.log(error);
  } else {
    console.log('===== SMTP CONNECTION VERIFICATION SUCCESS =====');
  }
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