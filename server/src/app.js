import Fastify from 'fastify';
import mainRoutes from './routes/mainRoutes.js';

const app = Fastify({logger: false});
app.register(mainRoutes, { prefix: '/api' });

export default app;