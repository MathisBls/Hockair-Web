import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true pour SSL, false pour STARTTLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export const sendFriendRequestNotification = async (recipientEmail, senderUsername) => {
  try {
    const mailOptions = {
      from: `"Hockair" <${process.env.SMTP_USER}>`, // sender address
      to: recipientEmail, // list of receivers
      subject: 'New Friend Request on Hockair', // Subject line
      html: `
        <h3>Hello,</h3>
        <p>You have received a new friend request from <strong>${senderUsername}</strong>.</p>
        <p>Log in to your account to accept or decline the request.</p>
        <p><a href="${process.env.FRONTEND_URL}/friends">Go to Friends Page</a></p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Friend request email sent successfully.');
  } catch (error) {
    console.error('Error sending friend request email:', error);
  }
};
export const sendActivationEmail = async (email, token) => {
  try {
    const activationLink = `${process.env.FRONTEND_URL}/activate/${token}`;
    const mailOptions = {
      from: '"Hockair Support" <no-reply@hockair.com>',
      to: email,
      subject: 'Activate Your Account',
      html: `
        <p>Hello,</p>
        <p>Thank you for registering on Hockair!</p>
        <p>Please click the link below to activate your account:</p>
        <a href="${activationLink}">${activationLink}</a>
        <p>If you did not request this, please ignore this email.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Activation email sent successfully.');
  } catch (error) {
    console.error('Error sending activation email:', error);
    throw new Error('Could not send activation email.');
  }
};
