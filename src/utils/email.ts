import axios from 'axios';

interface EmailOptions {
  email: string;
  subject: string;
  template?: string;
  data?: Record<string, any>;
}

export const sendEmail = async (options: EmailOptions) => {
  try {
    console.log('===== sendEmail CALLED =====');

    const html = `
      <div style="font-family: Arial, sans-serif;">
        <h2>Dream Paradise</h2>

        <p>Hello ${options.data?.name || 'User'},</p>

        <p>
          Thank you for contacting us.
          We have received your message successfully.
        </p>

        <p>
          Our team will get back to you soon.
        </p>

        <br />

        <p>Regards,</p>
        <p><strong>Dream Paradise Team</strong></p>
      </div>
    `;

    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: {
          name: process.env.SMTP_FROM_NAME,
          email: process.env.SMTP_FROM_EMAIL,
        },

        to: [
          {
            email: options.email,
          },
        ],

        subject: options.subject,

        htmlContent: html,
      },

      {
        headers: {
          'api-key': process.env.BREVO_API_KEY as string,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('===== EMAIL SENT SUCCESS =====');
    console.log(response.data);

    return response.data;

  } catch (error: any) {
    console.log('===== EMAIL ERROR =====');

    if (error.response) {
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }

    throw error;
  }
};