import userModel from "../models/userModel.js";



const emailYaRegistrado = async ( email = '' ) => {
    
    try {
        const existeEmail = await userModel.findOne({ email });
        return !!existeEmail;   //^ Si el email existe, devuelve true. Si no existe, devuelve false
        
    } catch (error) {
        console.log(error);
        
        throw new Error('Error al verificar si el emaail, Basee de datos no disponible');
        
    }
}



export {
    emailYaRegistrado
};