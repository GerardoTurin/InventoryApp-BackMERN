import nodemailer from "nodemailer";










const sendEmail = async (datos) => {

    // Creamos el objeto transporter, que es el que se encarga de enviar el email...
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: 587,
        //secure: true,
        //connectionTimeout: 6000, // aumentar timeout para conexiones lentas
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        },
        /* tls: {
            rejectUnauthorized: false   // Para que no de error al enviar el email...
        } */
    });


    const { send_to, sent_from, reply_to, subject, message } = datos;

    // Enviamos el email
    const options = {
        from: sent_from,
        to: send_to,
        replyTo: reply_to,
        subject: subject,
        html: message
    }

    transporter.sendMail(options, (error, info) => {
        if (error) {
            console.log(error);
            return error;
        } else {
            console.log(info);
            return info;
        }
    });
};



export default sendEmail;