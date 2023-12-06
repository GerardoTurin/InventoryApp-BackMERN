import express from 'express';
import cors from 'cors';
import { conectionDB } from '../DB/configDB.js';
import userRouter from '../routes/userRoute.js';
import productRouter from '../routes/productRoute.js';
import contactRouter from '../routes/contactRoute.js';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import path, { dirname } from 'path';

const __dirname = dirname(path.resolve());

class Server {
        constructor() {
            this.app = express();
            this.port = process.env.PORT || 5000;
            this.paths = {
                userPath: '/api/user',       // Creamos una ruta para los eventos
                productPath: '/api/product',     // Creamos una ruta para los eventos
                contactPath: '/api/contact',       // Creamos una ruta para los eventos
            }

            //Coneccion a la base de datos
            this.conectarDB();

            // Middlewares
            this.middlewares();
    
            // Rutas de mi app
            this.routes();
        };



        async conectarDB() {
            await conectionDB();
        };

        middlewares() {

            // Cors
            this.app.use( cors({
                origin: ['http://localhost:5173', 'https://inventory-app-mern.netlify.app'],
                credentials: true
            }) ); // use: para usar un middleware

            // Lectura y parseo del body
            this.app.use( express.json() ); 
            this.app.use(cookieParser(
                { sameSite: 'none', secure: true}
            ));   // cookieParser: para usar cookies, se usa antes de las rutas
            this.app.use( express.urlencoded({ extended: false }));
            this.app.use( bodyParser.json() );

            // Directorio carpeta publica
            //this.app.use(express.static(path.join( dirname, 'public')));   // use: para usar un middleware
            //this.app.use(express.static(path.join( path.dirname(import.meta.url), '/public/index.html')));
            //this.app.use(express.static('public'));   // use: para usar un middleware

            // Subir archivo a la carpeta uploads
            this.app.use("/uploads", express.static(path.join( __dirname, '../uploads')));   // use: para usar un middleware

        };



        // Rutas de mi app
        routes() {
            this.app.use( this.paths.userPath, userRouter );
            this.app.use( this.paths.productPath, productRouter );
            this.app.use( this.paths.contactPath, contactRouter );
            //this.app.use( "/", publicRoute );
        };


        listen() {
            this.app.listen( this.port, () => {
                console.log('Servidor corriendo en puerto', this.port);
            });
        };
};


export default Server;