import Fastify from 'fastify';
import fastifyFormbody from '@fastify/formbody';
import mainRoutes from './routes/mainRoutes.js';
import authRoutes from './routes/authRoutes.js';
import prisma from './config/DBConfig.js';
import jwtPlugin from './plugins/jwtPlugin.js';
import ajvErrors from 'ajv-errors';
import { responseError } from './utils/mainUtils.js';

const app = Fastify({
    logger: false,
    ajv: {
    customOptions: {
      allErrors: true,
    },
    plugins: [ajvErrors],
  },
});

app.register(fastifyFormbody);
app.register(mainRoutes, { prefix: '/api/main' });
app.register(authRoutes, { prefix: '/api/auth' });
app.register(jwtPlugin);

app.setErrorHandler((error, request, reply) => {
  if (error.validation) {

    return responseError(reply, 400, 'Validation Failed', 'errors', error.validation.map(e => e.message));
  }

  return responseError(reply, error.statusCode || 500, error.message || 'Internal Server Error');
});

export default app;