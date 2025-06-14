import { 
    describe, 
    it, 
    expect, 
    vi 
} from 'vitest';
import {
    responseSuccess,
    responseError,
    GITHUB_REPO_URL,
    LOGGER_LEVEL,
    PORT,
    HOST,
    NODE_ENV
} from '../../utils/mainUtils.js';


describe('responseSuccess()', () => {
    it('should return a successful response with default key "data"', () => {
        const mockReply = {
        code: vi.fn().mockReturnThis(),
        send: vi.fn()
        };

        responseSuccess(mockReply, 200, 'Success message', null, { name: 'Andrean' });

        expect(mockReply.code).toHaveBeenCalledWith(200);
        expect(mockReply.send).toHaveBeenCalledWith({
        success: true,
        message: 'Success message',
        data: { name: 'Andrean' }
        });
    });

    it('should use a custom key when provided', () => {
        const mockReply = {
        code: vi.fn().mockReturnThis(),
        send: vi.fn()
        };

        responseSuccess(mockReply, 201, 'Created', 'result', { id: 1 });

        expect(mockReply.code).toHaveBeenCalledWith(201);
        expect(mockReply.send).toHaveBeenCalledWith({
        success: true,
        message: 'Created',
        result: { id: 1 }
        });
    });
});

describe('responseError()', () => {
    it('should return an error response with default key "error"', () => {
        const mockReply = {
        code: vi.fn().mockReturnThis(),
        send: vi.fn()
        };

        responseError(mockReply, 400, 'Bad Request', null, { issue: 'Missing field' });

        expect(mockReply.code).toHaveBeenCalledWith(400);
        expect(mockReply.send).toHaveBeenCalledWith({
        success: false,
        message: 'Bad Request',
        error: { issue: 'Missing field' }
        });
    });

    it('should support custom error key', () => {
        const mockReply = {
        code: vi.fn().mockReturnThis(),
        send: vi.fn()
        };

        responseError(mockReply, 500, 'Server error', 'details', 'Something broke');

        expect(mockReply.code).toHaveBeenCalledWith(500);
        expect(mockReply.send).toHaveBeenCalledWith({
        success: false,
        message: 'Server error',
        details: 'Something broke'
        });
    });
});

describe('Environment Constants', () => {
    it('should export environment variables with fallback defaults', () => {
        expect(typeof GITHUB_REPO_URL).toBe('string');
        expect(typeof LOGGER_LEVEL).toBe('string');
        expect(typeof NODE_ENV).toBe('string');
        expect(typeof HOST).toBe('string');
        expect(typeof PORT).toBe('number' || 'string'); // sometimes process.env is string

        expect(['info', 'warn', 'error', 'debug']).toContain(LOGGER_LEVEL);
        expect(['development', 'production', 'test']).toContain(NODE_ENV);
    });
});