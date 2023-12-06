import  jwt  from "jsonwebtoken";



const generateJWT = (id, name) => {

    return new Promise((resolve, reject) => {
        const payload = { id, name };

        jwt.sign(payload, process.env.SECRETORPRIVATEKEY_JWT, { expiresIn: '1d' }, (error, token) => {

            if (error) {
                console.log(error);
                reject('Error al crear el token');
            } else {
                resolve(token);
            }
        });
    });
};


export { 
    generateJWT 
};