import axios from 'axios';

interface EmailOptions {
  email: string;
  subject: string;
  type?: 'user' | 'admin';
  data?: Record<string, any>;
}

export const sendEmail = async (options: EmailOptions) => {
  try {
    console.log('===== sendEmail CALLED =====');

    let html = '';

    // USER AUTO REPLY
    if (options.type === 'user') {
      html = `
        <div style="font-family: Arial, sans-serif;">
          <h2>Dream Paradise</h2>

          <p>Hello ${options.data?.name || 'User'},</p>

          <p>
            Thank you for contacting us.
            We have received your message successfully.
          </p>

          <p>Our team will get back to you soon.</p>

          <br />

          <p>Regards,</p>
          <p><strong>Dream Paradise Team</strong></p>
        </div>
      `;
    }

    // ADMIN EMAIL
    if (options.type === 'admin') {
      html = `
        <div style="font-family: Arial, sans-serif;">
          <h2>New Contact Form Submission</h2>

          <table border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse;">
            <tr>
              <td><strong>Name</strong></td>
              <td>${options.data?.name}</td>
            </tr>

            <tr>
              <td><strong>Email</strong></td>
              <td>${options.data?.email}</td>
            </tr>

            <tr>
              <td><strong>Subject</strong></td>
              <td>${options.data?.subject}</td>
            </tr>

            <tr>
              <td><strong>Message</strong></td>
              <td>${options.data?.message}</td>
            </tr>
          </table>
        </div>
      `;
    }

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