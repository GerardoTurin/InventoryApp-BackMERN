import asyncHandler from "express-async-handler";
import Product from "../models/productModel.js";
import { fileSizeFormatter } from "../utils/fileUpload.js";
import {v2 as cloudinary} from 'cloudinary';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
dotenv.config(); // Configuración de dotenv...



//! POST - Create Product

const createProduct = asyncHandler(async (req, res) => {
    const { name, sku, category, quantity, price, description } = req.body;

    // Campos obligatorios
    if ( !name || !sku || !category || !quantity || !price || !description ) {
        return res.status(400).json({
            ok: false,
            msg: "Completa todos los campos son obligatorios",
        });
    }

    // Generar un public_id único para la imagen...
    const public_id = uuidv4();


    // Subir imagen...
    let fileData = {};

    // Si se subió un archivo...
    if (req.file) {
        let uploadFile;

        try {
            // Subir imagen a Cloudinary...
            uploadFile = await cloudinary.uploader.upload(req.file.path, {
                folder: 'inventarioApp2023', // Carpeta donde se guardará la imagen...
                public_id, // Id de la imagen en Cloudinary...
                resource_type: 'image', // Tipo de recurso...
                overwrite: true, // Para sobreescribir la imagen...
            });
            console.log(uploadFile);
            
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                ok: false,
                msg: "Error al subir la imagen",
            });
        }

        fileData = {
            fileName: req.file.originalname,
            filePath: uploadFile.secure_url,
            fileType: req.file.mimetype,
            fileSize: fileSizeFormatter(req.file.size, 2),   // 2 decimales, por defecto para el tamaño del archivo...
            public_id: uploadFile.public_id, // Id de la imagen en Cloudinary...
        };
    };

    


    // Crear producto
    const product = await Product.create({
        user: req.user.id,  // El id del usuario que creó el producto...
        name,
        sku,
        category,
        quantity,
        price,
        description,
        image: fileData
    });

    res.status(201).json({
        ok: true,
        msg: "Producto creado exitosamente",
        product,
    });

    console.log(product);
});





//! GET - Get All Products

const getProducts = asyncHandler(async (req, res) => {
    const products = await Product.find({ user: req.user.id }).sort({ createdAt: -1 }); // Ordenamos los productos por fecha de creación...

    res.status(200).json({
        ok: true,
        msg: "Lista de productos",
        products,
    });
});




//! GET - Get Product By Id

const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return res.status(404).json({
            ok: false,
            msg: "Producto no encontrado",
        });
    }

    if (product.user.toString() !== req.user.id) { // Si el usuario que creó el producto es diferente al usuario que está haciendo la petición...
        
        return res.status(401).json({
            ok: false,
            msg: "No estas autorizado",
        });
    }

    res.status(200).json({
        ok: true,
        msg: "Producto encontrado",
        product,
    });
});




//! DELETE - Delete Product By Id

const deleteProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return res.status(404).json({
            ok: false,
            msg: "Producto no encontrado",
        });
    }

    if (product.user.toString() !== req.user.id) { // Si el usuario que creó el producto es diferente al usuario que está haciendo la petición...
        
        return res.status(401).json({
            ok: false,
            msg: "No estas autorizado",
        });
    };

    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

    // eliminar imagen de Cloudinary...
    await cloudinary.uploader.destroy(product.image.public_id);

    res.status(200).json({
        ok: true,
        msg: "Producto eliminado",
        deletedProduct,
    });
});




const eliminarVariosProductos = asyncHandler(async (req, res) => {
    const { ids } = req.body;

    const products = await Product.find({ _id: { $in: ids } }); // Buscamos los productos que esten en el array de ids...

    if (products.length !== ids.length) { // Si la cantidad de productos que se encontraron es diferente a la cantidad de ids que se enviaron...
        return res.status(404).json({
            ok: false,
            msg: "No se encontraron todos los productos",
        });
    };

    
    // Eliminar productos de la base de datos...
    await Product.deleteMany({ _id: { $in: ids } });
    
    // Eliminar imagenes de Cloudinary...
    for (let i = 0; i < products.length; i++) {
        const product = products[i];
        await cloudinary.uploader.destroy(product.image.public_id);
    };

    res.status(200).json({
        ok: true,
        msg: "Productos eliminados",
    });
});









//! PATCH - Update Product By Id

const updateProduct = asyncHandler(async (req, res) => {
    const { name, category, quantity, price, description } = req.body;
    const { id } = req.params;
    
    const product = await Product.findById(id);  // Buscamos el producto por id...

    if (!product) {
        return res.status(404).json({
            ok: false,
            msg: "Producto no encontrado",
        });
    };


    // Si el usuario que creó el producto es diferente al usuario que está haciendo la petición...
    if (product.user.toString() !== req.user.id) { 
        
        return res.status(401).json({
            ok: false,
            msg: "No estas autorizado",
        });
    };
    
    
    // Subir imagen...
    let fileData = {};

    
    // Si se subió un archivo...
    if (req.file) { 

        if (product.image.public_id !== req.body.public_id) { 
            // Eliminar imagen de Cloudinary...
            await cloudinary.uploader.destroy(product.image.public_id);
        };
        
        let uploadFile;

        try {

            // Subir imagen a Cloudinary...
            uploadFile = await cloudinary.uploader.upload(req.file.path, {
                folder: 'inventarioApp2023', // Carpeta donde se guardará la imagen...
                resource_type: 'image', // Tipo de recurso...
                overwrite: true, // Para sobreescribir la imagen...
                public_id: req.body.public_id, // Id de la imagen en Cloudinary...
            });
            console.log(uploadFile);
            
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                ok: false,
                msg: "Error al subir la imagen",
            });
        }

        fileData = {
            fileName: req.file.originalname,
            filePath: uploadFile.secure_url,
            fileType: req.file.mimetype,
            fileSize: fileSizeFormatter(req.file.size, 2),   // 2 decimales, por defecto para el tamaño del archivo...
            public_id: uploadFile.public_id, // Id de la imagen en Cloudinary...
        };
    };


    // Actualizar producto
    const updateProduct = await Product.findByIdAndUpdate(
        {_id: id},  // Buscamos el producto por id... 
        {
            name,
            category,
            quantity,
            price,
            description,
            image: Object.keys(fileData).length === 0 ? product?.image : fileData, // Si no se subió una imagen, se mantiene la imagen que ya tenía el producto...
        }, 
        { 
            new: true,  // new: true, para que devuelva el producto actualizado...
            runValidators: true,    // Para que se ejecuten las validaciones del modelo... 
        } 
    ); 



    res.status(201).json({
        ok: true,
        msg: "Producto Actualizado exitosamente",
        updateProduct,
    });


    
});





export {
    createProduct,
    getProducts,
    getProductById,
    deleteProductById,
    updateProduct,
    eliminarVariosProductos,
}