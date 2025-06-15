import fastifyJWT from '@fastify/jwt';
import { JWT_SECRET, responseError } from '../utils/mainUtils.js';

const jwtPlugin = async (app) => {
  app.register(fastifyJWT, {
    secret: JWT_SECRET,
    sign: {
      expiresIn: '1h',
    },
  });

  app.decorate('authenticate', async function (request, reply) {
    try {
      await request.jwtVerify();
    } catch (err) {
      return responseError(reply, 401, 'Unauthorized', 'error', err.message);
    }
  });
};

export default jwtPlugin;