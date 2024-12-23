import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: 'smtp.example.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const sendActivationEmail = async (email, token) => {
    try {
        const activationLink = `${process.env.FRONTEND_URL}/activate/${token}`;
        const mailOptions = {
            from: '"AirHockey" <noreply@airhockey.com>',
            to: email,
            subject: 'Activate Your Account',
            html: `
                <p>Thank you for registering on AirHockey! Please click the link below to activate your account:</p>
                <a href="${activationLink}">${activationLink}</a>
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log('Activation email sent successfully.');
    } catch (error) {
        console.error('Error sending activation email:', error);
        throw new Error('Could not send activation email.');
    }
};
