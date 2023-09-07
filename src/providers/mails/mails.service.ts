import { Injectable, Logger } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

@Injectable()
export class MailsService {
  sendMail = async (
    text: string,
    html: string,
    recipient: string,
    subject: string,
  ) => {
    const transporter: Transporter<SMTPTransport.SentMessageInfo> =
      createTransport({
        host: 'smtp.zoho.com',
        secure: true,
        port: 465,
        auth: {
          user: process.env.NODEMAILER_USER,
          pass: process.env.NODEMAILER_PASS,
        },
      });

    const mailOptions = {
      from: process.env.NODEMAILER_USER,
      to: recipient,
      subject,
      text,
      html,
    };

    // send mail

    try {
      const response: SMTPTransport.SentMessageInfo =
        await transporter.sendMail(mailOptions);
    } catch (error) {}
  };

  sendPdf = async (
    // text: string,
    // html: string,
    recipient: string,
    subject: string,
    pdf: any,
  ) => {
    const transporter: Transporter<SMTPTransport.SentMessageInfo> =
      createTransport({
        host: 'smtp.zoho.com',
        secure: true,
        port: 465,
        auth: {
          user: process.env.NODEMAILER_USER,
          pass: process.env.NODEMAILER_PASS,
        },
      });

    const mailOptions = {
      from: process.env.NODEMAILER_USER,
      to: recipient,
      subject,
      // text,
      // html,
      attachments: [
        {
          filename: 'receipt.pdf',
          content: pdf,
          contentType: 'application/pdf',
        },
      ],
    };

    // send mail

    try {
      const response: SMTPTransport.SentMessageInfo =
        await transporter.sendMail(mailOptions);
    } catch (error) {}
  }
}
