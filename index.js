import 'dotenv/config'      // Cargar variables de entorno
import Server from './models/Server.js';



const servidor = new Server();

servidor.listen();