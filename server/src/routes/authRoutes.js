import { 
    loginController 
} from "../controllers/authControllers.js";
import { 
    registerSchema, 
    loginSchema 
} from "../schemas/authSchemas.js";

const authRoutes = async(fastify, options) => {
    fastify.post('/login', {schema: loginSchema}, loginController);
}

export default authRoutes;