import { Router } from 'express';
import { checkAuth } from '../middlewares/authCheck.js';
import { upload } from '../utils/fileUpload.js';
import { createProduct, 
        deleteProductById, 
        getProductById, 
        getProducts, 
        updateProduct,
        eliminarVariosProductos } from '../controllers/productController.js';






const productRouter = Router();



productRouter.post('/', 
                        checkAuth, 
                        upload.single('image'), //Aqui se indica el nombre del campo que se va a subir...
                        createProduct );


productRouter.get('/', 
                    checkAuth,
                    getProducts );


productRouter.get('/:id', 
                        checkAuth,
                        getProductById );


productRouter.delete('/:id',
                            checkAuth,
                            deleteProductById );

productRouter.delete('/',
                            checkAuth,
                            eliminarVariosProductos );


productRouter.patch('/:id', 
                        checkAuth,
                        upload.single('image'), //Aqui se indica el nombre del campo que se va a subir...
                        updateProduct );



export default productRouter;