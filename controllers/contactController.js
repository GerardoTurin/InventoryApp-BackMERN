import asyncHandler from "express-async-handler";
import userModel from "../models/userModel.js";
import sendEmail from "../utils/sendEmail.js";



const contactUs = asyncHandler(async (req, res) => {
    const { subject, message } = req.body;
    const { id } = req.user;

    const user = await userModel.findById( id );  // Buscamos el producto por id...

    if (!user) {
        return res.status(404).json({
            ok: false,
            msg: "Usuario no encontrado",
        });
    };


    //  subject y message son obligatorios
    if (!subject || !message) {
        return res.status(400).json({
            ok: false,
            msg: "Debes ingresar un asunto y un mensaje",
        });
    };


    const reply_to = user.email;
    const sent_from = process.env.EMAIL_USER;
    const send_to = process.env.EMAIL_USER;

    try {
        // Enviamos el email
        await sendEmail({ send_to, sent_from, subject, message, reply_to });

        res.status(200).json({
            ok: true,
            msg: 'Ya se envio el email, te responderemos lo antes posible',

        });
    } catch (error) {
        return res.status(500).json({
            ok: false,
            msg: 'Error al enviar el email para contactarnos, intentalo de nuevo'
        });
    };

});




export {
    contactUs,
};