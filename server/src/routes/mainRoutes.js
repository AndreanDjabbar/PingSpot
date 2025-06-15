import { 
    defaultController 
} from "../controllers/mainControllers.js"

const mainRoutes = async(fastify, options) => {
    fastify.get('/', defaultController);
}

export default mainRoutes;