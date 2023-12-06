import { Router } from 'express';
import { contactUs } from '../controllers/contactController.js';
import { checkAuth } from '../middlewares/authCheck.js';













const contactRouter = Router();



contactRouter.post('/',
                        checkAuth,
                        contactUs );












export default contactRouter;