import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { emailYaRegistrado } from '../helpers/validatorDB.js';
import { 
    changePassword, 
    confirmUser, 
    forgotPassword, 
    getUserById, 
    getUsers, 
    loginStatus, 
    resetPassword, 
    updateUser, 
    userLogin, 
    userLogout, 
    userRegister } from '../controllers/userController.js';


// Middlewares
import { validateFields } from '../middlewares/validateFields.js';
import { checkAuth } from '../middlewares/authCheck.js';




const userRouter = Router();

const validateName = [ body('name', 'El nombre es necesario').not().isEmpty() ];  
const validateEmail = [ body('email', 'El correo no es valido').custom( emailYaRegistrado ).isEmail() ];
const validateMinPassword = [ body('password', 'La contraseña es obligatoria y/o debe tener mas de 6 caracteres').isLength({ min: 6 }) ];
const validateMaxPassword = [ body('password', 'La contraseña es obligatoria y/o debe tener menos de 20 caracteres').isLength({ max: 18 }) ];



//! POST - Register User
userRouter.post('/register', 
                validateName,
                validateEmail,
                validateMinPassword,
                validateMaxPassword,
                validateFields,
                userRegister);


//! GET - Confirm User
userRouter.get('/register/confirm/:confirmToken', confirmUser);



//! POST - Login User
userRouter.post('/login',
                validateEmail,
                validateMinPassword,
                validateMaxPassword,
                validateFields,
                userLogin);


//! GET - Logout User
userRouter.get('/logout', userLogout);



//! GET - Get All Users
userRouter.get('/allusers',
                getUsers);


//! GET - Get User By ID
userRouter.get('/:userbyid', 
                //checkAuth,
                loginStatus,
                getUserById);


//! GET - Login Status
userRouter.get('/loggedin', 
                loginStatus);


//! PATCH - Update User
userRouter.patch('/updateuser',
                checkAuth,
                updateUser);


//! PATCH - Change Password
userRouter.patch('/changepassword',
                checkAuth,
                changePassword);



//! POST - Forgot Password (Olvide mi contraseña)
userRouter.post('/forgot-password', forgotPassword);


//! GET - Reset Password (Reestablecer contraseña)
userRouter.put('/reset-password/:resetToken', resetPassword)



export default userRouter;