import { 
    loginController,
    registerController
} from "../controllers/authControllers.js";
import { 
    registerSchema, 
    loginSchema 
} from "../schemas/authSchemas.js";

const authRoutes = async(fastify, options) => {
    fastify.post('/login', {schema: loginSchema}, loginController);
    fastify.post('/register', {schema: registerSchema}, registerController);
}

export default authRoutes;