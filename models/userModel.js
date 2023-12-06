import bcryptjs from 'bcryptjs'; // Encriptar contraseñas
import mongoose from "mongoose";
const { Schema, model } = mongoose;



const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: [true, "El correo ya está registrado"],
        trim: true,
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            "Por favor ingrese un correo electrónico válido",
        ]
    },
    password: {
        type: String,
        required: true,
        minLenght: [6, "La contraseña debe tener al menos 6 caracteres"],
        maxLenght: [18, "La contraseña debe tener como máximo 18 caracteres"],
    },
    photo: {
        type: String,
        required: false,
        default: "https://i.ibb.co/4pDNDk1/avatar.png",
    },
    phone: {
        type: String,
        required: false,
        default: "",
    },
    checkUser: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,   // Para que nos cree la fecha de creacion y la fecha de actualizacion...
});




//^ Encriptar contraseña
const SALT_ROUNDS = 10;

// Encriptar contraseña antes de guardar el usuario
userSchema.pre('save', async function(next) {
    // Si el password no ha sido modificado, no lo encriptamos
    if (!this.isModified('password')) { 
        return next();
    }

    try {
        const salt = await bcryptjs.genSalt(SALT_ROUNDS);   // Generar un salt, para encriptar el password...
        const hashedPassword = await bcryptjs.hash(this.password, salt);    // Encriptar el password...
        this.password = hashedPassword; // Asignar el password encriptado al password del usuario...
        next(); // Continuar con el proceso...
    } catch (error) {
        next(error);    // Si hay un error, lo pasamos al siguiente middleware...
    }
});



export default model('User', userSchema);