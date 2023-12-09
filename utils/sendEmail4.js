import { Resend } from 'resend';

const resend = new Resend('re_N5HMgxLH_enkcv8skXzkS1U4vwmfrHyDj');


const sendEmail = async (datos) => {
    const { send_to, sent_from, reply_to, subject, message } = datos;

    try {
        const email = await resend.emails.send({
            from: sent_from,
            to: send_to,
            subject: subject,
            html: message
        });

        console.log(email);
        return email;
        
    } catch (error) {
        console.log(error);
        return error;
    }


};

export default sendEmail;