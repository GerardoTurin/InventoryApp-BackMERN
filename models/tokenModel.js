import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,   // El tipo de dato es un ObjectId, y es el id del usuario...
        required: true,
        ref: "User",    // Hace referencia a la colección User...
    },
    token: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        required: true,
    },
    expireAt: {
        type: Date,
        required: true,
    }
});


const Token = mongoose.model("Token", tokenSchema); // Token es el nombre de la colección en la base de datos...

export default Token;