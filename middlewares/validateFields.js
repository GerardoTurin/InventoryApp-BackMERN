import { response, request } from 'express';
import { validationResult } from 'express-validator';


// Middleware para validar los campos, si hay errores los muestra...
const validateFields = (req = request, res = response, next) => {

    const errores = validationResult(req);  // validationResult: es una funcion que nos da express-validator
    if ( !errores.isEmpty() ) {            // isEmpty: es una funcion que nos da express-validator, si no hay errores devuelve true...
        return res.status(400).json({
            ok: false,
            errores: errores.mapped()   // mapped: es una funcion que nos da express-validator, nos devuelve un objeto con los errores...
        });
    };

    next(); // Si no hay errores continua con el siguiente middleware...
};




export {
    validateFields
};