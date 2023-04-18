import Mailgen from 'mailgen';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const GetEmailTools = () => {
  try {
    // instantiate mailgen generator to create emails
    const generator = new Mailgen({
      theme: 'default',
      product: {
        name: 'Bar Crawl Planner',
        link: 'http://localhost:3000/homepage',
      },
    });
    // create nodemailer gmail transporter to send emails
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_PASSWORD,
      },
    });

    return { generator, transporter };
  } catch (error) {
    console.log('Error in GetEmailTools: ', error);
    return { generator: null, transporter: null };
  }
};

export default GetEmailTools;
