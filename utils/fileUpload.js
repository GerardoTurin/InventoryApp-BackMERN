import multer from "multer";

// Definimos el destino de los archivos, y el nombre de los archivos...
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname) // El nombre del archivo será la fecha y hora en que se subió el archivo...
    }
});



// Definimos el tipo de archivo que se puede subir...

function fileFilter(req, file, cb) {
    if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'
        ) {
            // Para aceptar el archivo es necesario pasar `true`, de la siguiente forma:
            cb(null, true)

        } else {
            // Para rechazar el archivo es necesario pasar `false`, de la siguiente forma:
            cb(null, false)
            
            // Siempre puedes pasar un error en caso de que algo salga mal:
            cb(new Error('No tienes permitido subir este tipo de archivo.'))
        }

};


const upload = multer({ storage: storage, fileFilter: fileFilter });    // upload: es el nombre del middleware, que se usará en el controlador...

// File Size Formatter

function fileSizeFormatter(bytes, decimal) {    // bytes: es el tamaño del archivo, decimal: es el número de decimales que se mostrarán...
    if (bytes === 0) {
        return '0 Bytes';
    }
    const dm = decimal || 2;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const index = Math.floor(Math.log(bytes) / Math.log(1000));
    return parseFloat((bytes / Math.pow(1000, index)).toFixed(dm)) + ' ' + sizes[index];
};


export { upload, fileSizeFormatter };