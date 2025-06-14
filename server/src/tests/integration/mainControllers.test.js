import { 
    afterAll, 
    beforeAll, 
    describe, 
    expect, 
    it
} from 'vitest';
import app from '../../app.js';

beforeAll(async () => {
    await app.ready();
});

afterAll(async () => {
    await app.close();
});

describe('GET /api', () => {
    it('should return a success message', async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/api'
        });

        expect(response.statusCode).toBe(200);
        expect(response.statusCode).toBeTypeOf('number');
        expect(response.json()).toEqual(expect.objectContaining({
            success: true,
            message: "Welcome to Pingspot API",
        }));
    });
});