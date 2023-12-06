import mongoose from "mongoose";


const productSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    name: {
        type: String,
        required: [true, "Debe ingresar un nombre para el producto."],
        trim: true, // Elimina los espacios en blanco al inicio y al final del string...
    },
    sku: {
        type: String,
        required: true,
        default: "SKU",
        trim: true,
    },
    category: {
        type: String,
        required: [true, "Debe ingresar una categoría para el producto."],
        trim: true,
    },
    quantity: {
        type: String,
        required: [true, "Debe ingresar una cantidad para el producto."],
        trim: true,
    },
    price: {
        type: String,
        required: [true, "Debe ingresar un precio para el producto."],
        trim: true,
    },
    description: {
        type: String,
        required: [true, "Debe ingresar una descripción para el producto."],
        trim: true,
    },
    image: {
        type: Object,
        default: {},
    },
}, {
    timestamps: true,   // Crea dos campos: createdAt y updatedAt, que se actualizan automáticamente...
});

const Product = mongoose.model("Product", productSchema);

export default Product;