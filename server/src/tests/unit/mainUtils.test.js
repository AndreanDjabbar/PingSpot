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
    NODE_ENV,
    JWT_SECRET,
    REDIS_HOST,
    REDIS_PORT,
    REDIS_PASSWORD,
    CLIENT_URL,
    EMAIL,
    EMAIL_PASSWORD,
    hashPassword,
    comparePassword,
    AppError,
    sendEmail
} from '../../utils/mainUtils.js';
import nodemailer from 'nodemailer';

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
        expect(typeof PORT).toBe('number' || 'string');
        expect(typeof JWT_SECRET).toBe('string');
        expect(typeof REDIS_HOST).toBe('string');
        expect(typeof REDIS_PORT).toBe('number' || 'string');
        expect(typeof REDIS_PASSWORD).toBe('string');
        expect(typeof CLIENT_URL).toBe('string');
        expect(typeof EMAIL).toBe('string');
        expect(typeof EMAIL_PASSWORD).toBe('string');

        expect(['info', 'warn', 'error', 'debug']).toContain(LOGGER_LEVEL);
        expect(['development', 'production', 'test']).toContain(NODE_ENV);
    });
});

describe('Password Hashing', () => {
    it('should hash and compare passwords correctly', async () => {
        const password = 'testPassword123';
        const hashedPassword = await hashPassword(password);

        expect(hashedPassword).toBeDefined();
        expect(hashedPassword).not.toBe(password);

        const isMatch = await comparePassword(password, hashedPassword);
        expect(isMatch).toBe(true);

        const wrongPassword = 'wrongPassword';
        const isWrongMatch = await comparePassword(wrongPassword, hashedPassword);
        expect(isWrongMatch).toBe(false);
    });

    it('should throw an error if password hashing fails', async () => {
        const invalidPassword = null; 
        await expect(hashPassword(invalidPassword)).rejects.toThrow();
    });
});

describe ('AppError class functionality', () => {
    it('should create an AppError instance with correct properties', () => {
        const error = new AppError('Test error message', 400);

        expect(error).toBeInstanceOf(AppError);
        expect(error.message).toBe('Test error message');
        expect(error.statusCode).toBe(400);
    });

    it('should default to status code 500 if not provided', () => {
        const error = new AppError('Default error message');

        expect(error.statusCode).toBe(500);
    });
});

describe('sendEmail function', () => {
    it('should send an email using nodemailer', async () => {
        const mockTransporter = {
            sendMail: vi.fn().mockResolvedValue({ response: 'Email sent' })
        };
        const createTransportSpy = vi.spyOn(nodemailer, 'createTransport').mockReturnValue(mockTransporter);

        const email = 'andreanjabar19@gmail.com';
        const context = 'register_validation';
        const verificationLink = 'vericationLinkEXAMPLE';
        const EMAIL = 'test@email.com';
        const EMAIL_PASSWORD = 'testpassword';

        const emailTemplates = {
            register_validation: vi.fn().mockReturnValue('<b>Test Email</b>')
        };

        const info = await sendEmail(email, context, verificationLink);

        expect(createTransportSpy).toHaveBeenCalled();
        expect(mockTransporter.sendMail).toHaveBeenCalled();
        expect(info).toEqual([true, null]);
    });
})