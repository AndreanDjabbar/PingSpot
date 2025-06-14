import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

console.log("USING: ", process.env.NODE_ENV, " environment");