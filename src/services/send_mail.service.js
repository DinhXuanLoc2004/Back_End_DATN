const nodemailer = require('nodemailer')

class SendMailService {
    static sendEmail = async (to, subject, text, html) => {
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'dinhxuanlocct@gmail.com',
                pass: process.env.APPLICATION_PASSWORD ?? ''
            }
        })
        const mailOptions = {
            from: 'dinhxuanlocct@gmail.com',
            to: to,
            subject: subject,
            text: text,
            html: html
        };
        transporter.sendMail(mailOptions)
    }
}

module.exports = SendMailService