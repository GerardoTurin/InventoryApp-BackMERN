import asyncHandler from "express-async-handler";
import  jwt  from "jsonwebtoken";
import userModel from "../models/userModel.js";


const checkAuth = asyncHandler(async (req, res, next) => {

    try {
        const token = req.cookies.token;    // Obtenemos el token de las cookies...
        if (!token) {
            return res.status(401).json({
                ok: false,
                msg: 'No tienes permiso para acceder a esta ruta, inicia sesión'
            });
        }

        // Verificamos el token
        const verifiedToken = jwt.verify(token, process.env.SECRETORPRIVATEKEY_JWT);  // Es para decodificar el token...

        // Buscamos el usuario por el id
        const user = await userModel.findById(verifiedToken.id).select('-password');  // Buscamos el usuario por el id, y le decimos que no nos muestre la contraseña...

        if (!user) {
            return res.status(404).json({
                ok: false,
                msg: 'El usuario no existe en la base de datos'
            });
        };

        // Si todo sale bien, le pasamos el usuario a la request...
        req.user = user;
        next();
    } catch (error) {
        console.log(error);

        return res.status(401).json({
            ok: false,
            msg: 'Token no valido'
        });
    }
});



export { checkAuth };