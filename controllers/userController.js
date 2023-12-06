import asyncHandler from "express-async-handler";
import { emailYaRegistrado } from "../helpers/validatorDB.js";
import userModel from "../models/userModel.js";
import { generateJWT } from "../helpers/generateToken.js";
import bcryptjs from 'bcryptjs'; // Encriptar contraseñas
import  jwt  from "jsonwebtoken";
import Token from "../models/tokenModel.js";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";


//! Register User


const userRegister = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if (await emailYaRegistrado(email)) {
        return res.status(400).json({
            ok: false,
            msg: "El correo ya está registrado",
        });
    };

    // Create User
    const newUser = new userModel({ name, email, password });

    // Save User
    await newUser.save();

    // Generate JWT
    const token = await generateJWT(newUser.id, newUser.name);

    // Create confirmation token
    let confirmToken = crypto.randomBytes(32).toString('hex') + newUser.id;

    // Create the hash of the token
    const hashedToken = crypto
                            .createHash('sha256')
                            .update(confirmToken)
                            .digest('hex');

    // Save confirmation token in the database
    await new Token({
        userId: newUser.id,
        token: hashedToken,
        createdAt: Date.now(),
        expireAt: Date.now() + 30 * (60 * 1000 ) // 30 minutos
    }).save();

    // Build the confirmation link (URL)
    const confirmUrl = `${process.env.FRONTEND_URL}/register/confirm/${confirmToken}`;

    // Confirmation Email Template
    const message = `
        <h2>Hola ${newUser.name}</h2>
        <p>Gracias por registrarte en InventarioApp</p>
        <p>Para confirmar tu cuenta, haz clic en el siguiente enlace:</p>
        <a href=${confirmUrl}>
            Confirm Account
        </a>

        <p>Si tienes problemas con el botón de arriba, copia y pega la URL a continuación en tu navegador web.</p>
        <p>${confirmUrl}</p>

        <p>Gracias...<p/>
        <p>Equipo de <strong>InventarioApp</strong></p>
    `;

    const subject = 'Confirma tu cuenta';
    const send_to = newUser.email;
    const sent_from = 'InventarioApp <inventarioApp@resend.dev>';

    try {
        // Send the email
        await sendEmail({ send_to, sent_from, subject, message });

        res.status(201).json({
            ok: true,
            msg: "Usuario creado con éxito",
            _id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            password: newUser.password,
            photo: newUser.photo,
            phone: newUser.phone,
            token
        });
        
    } catch (error) {
        return res.status(500).json({
            ok: false,
            msg: 'Error al enviar el email'
        });
    }
});






//! Confirm User


const confirmUser = asyncHandler(async (req, res) => {
    const { confirmToken } = req.params;

    // Creamos el hash del token, para compararlo con el hash del token que esta en la base de datos...
    const hashedToken = crypto
        .createHash('sha256')
        .update(confirmToken)
        .digest('hex');    // Creamos el hash del token, para guardarlo en la base de datos...

    
    // Buscamos el token en la base de datos...
    const userToken = await Token.findOne({
        token: hashedToken,
        expireAt: { $gt: Date.now() }   // Si la fecha de expiracion es mayor a la fecha actual, es porque el token aun es valido...
    });


    // Si no existe el token, o el token ya expiro, retornamos un error...
    if (!userToken) {
        return res.status(404).json({
            ok: false,
            msg: 'Token no válido o expirado'
        });
    }

    const user = await userModel.findById({_id: userToken.userId});  // Buscamos el usuario en la base de datos...

    // En caso de que el usuario ya este confirmado...
    if (user.checkUser) {
        return res.status(400).json({
            ok: false,
            msg: 'El usuario ya esta confirmado'
        });
    }

    // Actualizamos el usuario
    user.checkUser = true;
    await user.save();

    res.status(200).json({
        ok: true,
        msg: 'Confirmaste tu cuenta, ya puedes iniciar sesión',
        _id: user.id,
        name: user.name,
        email: user.email,
        password: user.password,
        photo: user.photo,
        phone: user.phone,

    });
});





//! Login User

const userLogin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Find User
    const user = await userModel.findOne({ email });

    if (!user) {
        res.status(404).json({
            ok: false,
            msg: "El correo no está registrado",
        });
    };

    // Check Password
    const isMatchPassword = await bcryptjs.compare(password, user.password);

    if (!isMatchPassword) {
        res.status(400).json({
            ok: false,
            msg: "Password incorrecto",
        });
    };




    // Check if user is confirmed
    if (!user.checkUser) {
        return res.status(400).json({
            ok: false,
            msg: 'Por favor confirma tu cuenta para poder iniciar sesión'
        });
    }



    // Generate JWT
    const token = await generateJWT(user.id, user.name);

    // Send HTTP-only cookie with JWT
    res.cookie("token", token, {
        path: "/",
        httpOnly: true,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
        sameSite: "none",
        secure: true
    });

    res.status(200).json({
        ok: true,
        msg: "Usuario logueado Correctamente",
        _id: user.id,
        name: user.name,
        email: user.email,
        password: user.password,
        photo: user.photo,
        phone: user.phone,
        token
    });

});




//! Logout User

const userLogout = asyncHandler(async (req, res) => {

    // Hacemos que la cookie expire
    res.cookie("token", "", {
        path: "/",
        httpOnly: true,
        expires: new Date(0), // aqui le decimos que expire
        sameSite: "none",
        secure: true
    });

    return res.status(200).json({
        ok: true,
        msg: "Usuario Cerró Sesión Correctamente",
    });
});




//! GET - All Users

const getUsers = asyncHandler(async (req, res) => {
    const users = await userModel.find({});

    res.json({
        ok: true,
        msg: "Usuarios Obtenidos",
        users
    });
});



//! GET - User By ID

const getUserById = asyncHandler(async (req, res) => {
    const user = await userModel.findById(req.user.id);

    if (user) {
        res.status(200).json({
            ok: true,
            msg: "Usuario Encontrado",
            _id: user.id,
            name: user.name,
            email: user.email,
            photo: user.photo,
            phone: user.phone,
        });
    } else {
        res.status(404).json({
            ok: false,
            msg: "Usuario no encontrado",
        });
    };
});





//! GET Login Status

const loginStatus = asyncHandler(async (req, res) => {
    const token = req.cookies.token;    // Obtenemos el token de las cookies...

    if (!token) {
        return res.json(false)
    };
    

    // Verificamos el token
    const verifiedToken = jwt.verify(token, process.env.SECRETORPRIVATEKEY_JWT);  // Es para decodificar el token...
    
    // Si el token es valido, traer datos del usuario...
    const user = await userModel.findById(verifiedToken.id);  // Buscamos el usuario en la base de datos...
    
    
    if (verifiedToken) {
        return res.status(200).json({
            ok: true,
            msg: 'Usuario Con Sesion Activa',
            _id: user.id,
            name: user.name,
            email: user.email,
            photo: user.photo,
            phone: user.phone,
        })
    }

    //return res.json(false)  // Si no hay token, retornamos false...
});




//! PATCH - Update User

const updateUser = asyncHandler(async (req, res) => {
    const user = await userModel.findById(req.user.id);

    // Si el usuario existe, actualizamos los datos...
    if (user) {
        user.email = user.email;    // No permitimos que se actualice el email...
        user.name = req.body.name || user.name;   // Si no se envia el nombre, se queda el que ya estaba...
        user.photo = req.body.photo || user.photo;  // Si no se envia la foto, se queda la que ya estaba...
        user.phone = req.body.phone || user.phone;  // Si no se envia el telefono, se queda el que ya estaba...

        const updatedUser = await user.save();  // Guardamos los cambios...

        res.status(200).json({
            ok: true,
            msg: 'Usuario Actualizado Correctamente',
            _id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            photo: updatedUser.photo,
            phone: updatedUser.phone,
        });
    } else {
        res.status(404).json({
            ok: false,
            msg: 'No se encontro el usuario en la BD'
        });
    };
});





//! PATCH - Change Password ( Cambiar Password )

const changePassword = asyncHandler(async (req, res) => {
    const user = await userModel.findById(req.user.id);
    const { oldPassword, newPassword } = req.body;

    if (!user) {
        return res.status(404).json({
                ok: false,
                msg: "Usuario no encontrado, no se puede cambiar el password",
        });
    };


    // Ambos campos son obligatorios
    if (!oldPassword || !newPassword) {
        return res.status(400).json({
                ok: false,
                msg: "Ambos campos son obligatorios",
        });
    };

    // Validamos que el password antiguo sea correcto
    const isMatchPassword = await bcryptjs.compare(oldPassword, user.password);

    if (!isMatchPassword) {
        return res.status(400).json({
                ok: false,
                msg: "Password Actual Incorrecto",
        });
    } else {
        // Actualizamos el password
        user.password = newPassword;
        await user.save();

        res.status(200).json({
            ok: true,
            msg: "Password Cambiado Correctamente",
        });
    };
});





//! POST - Forgot Password (Olvide Password)

const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body; // Obtenemos el email del body...
    const user = await userModel.findOne({ email }); // Buscamos el usuario por el email...

    if (!user) {
        return res.status(404).json({
            ok: false,
            msg: 'No existe un usuario con ese email'
        });
    }


    // Eliminamos el token de la base de datos, si es que existe...
    let token = await Token.findOne({ userId: user.id });   // Buscamos el token en la base de datos...
    if (token) {
        await token.deleteOne();    // Si existe el token, lo eliminamos...
    }
    
    
    // Creamos el token, que es el que se envia por email...
    let resetToken = crypto.randomBytes(32).toString('hex') + user.id;  // Creamos el token aleatorio...
    console.log(resetToken);
    
    // Creamos el hash del token...
    const hashedToken = crypto
                            .createHash('sha256')
                            .update(resetToken)
                            .digest('hex');    // Creamos el hash del token, para guardarlo en la base de datos...
    
    // Guardamos el token en la base de datos...
    await new Token({
        userId: user.id,
        token: hashedToken,
        createdAt: Date.now(),
        expireAt: Date.now() + 30 * (60 * 1000 ) // 30 minutos
    }).save();

    // Construimos el link de restablecer contraseña ( URL)
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;    // Aqui se envia el token, no el hash del token...

    // Reset Email Template
    const message = `
        <h2>Hola ${user.name}</h2>
        <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
        <p>Si hiciste esta solicitud, haz clic en el siguiente enlace, de lo contrario, ignora este correo electrónico</p>
        <a href=${resetUrl}>
            Restore Password
        </a>
        
        <p>Si tienes problemas con el botón de arriba, copia y pega la URL a continuación en tu navegador web.</p>
        <p>${resetUrl}</p>

        <p>Gracias...<p/>
        <p>Equipo de <strong>InventarioApp</strong></p>
    `;


    const subject = 'Restablecer Contraseña';
    const send_to = user.email;
    const sent_from = 'InventarioApp <inventarioApp@resend.dev>';

    try {
        // Enviamos el email
        await sendEmail({ send_to, sent_from, subject, message });

        res.status(200).json({
            ok: true,
            msg: 'Olvidaste tu contraseña ( Ya se envio el email )',

        });
    } catch (error) {
        return res.status(500).json({
            ok: false,
            msg: 'Error al enviar el email'
        });
    }
});





//! PUT - Reset Password ( Restablecer Contraseña )

const resetPassword = asyncHandler(async (req, res) => {
    const { password } = req.body;  // Obtenemos el password del body...
    const { resetToken } = req.params;  // Obtenemos el token de la URL...


    // Creamos el hash del token, para compararlo con el hash del token que esta en la base de datos...
    const hashedToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');    // Creamos el hash del token, para guardarlo en la base de datos...


    // Buscamos el token en la base de datos...
    const userToken = await Token.findOne({ 
        token: hashedToken,
        expireAt: { $gt: Date.now() }   // Si la fecha de expiracion es mayor a la fecha actual, es porque el token aun es valido... 
    });


    // Si no existe el token, o el token ya expiro, retornamos un error...
    if (!userToken) {
        return res.status(404).json({
            ok: false,
            msg: 'Token no válido o expirado'
        });
    }


    // Buscamos el usuario en la base de datos...
    const user = await userModel.findById({_id: userToken.userId});
    user.password = password;   // Actualizamos el password del usuario...

    // Guardamos el usuario en la base de datos...
    await user.save();

    res.status(200).json({
        ok: true,
        msg: 'Contraseña Restablecida Correctamente, ya puedes iniciar sesión'
    });
});



export {
    userRegister,
    userLogin,
    userLogout,
    getUsers,
    getUserById,
    loginStatus,
    updateUser,
    changePassword,
    forgotPassword,
    resetPassword,
    confirmUser
};