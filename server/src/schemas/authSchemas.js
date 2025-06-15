export const loginSchema = {
  body: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string', minLength: 6 },
    },
    errorMessage: {
      required: {
        email: 'Email wajib diisi',
        password: 'Password wajib diisi',
      },
        properties: {
            email: 'Format email tidak valid',
            password: 'Password minimal 6 karakter',
        },
    },
  },
};

export const registerSchema = {
  body: {
    type: 'object',
    required: ['username', 'email', 'password', 'fullName', 'phone', 'provider'],
    properties: {
      username: { type: 'string', minLength: 3 },
      email: {
        type: 'string',
        format: 'email',
        errorMessage: {
          format: 'Email tidak valid',
        },
      },
      password: { type: 'string', minLength: 6 },
      fullName: { type: 'string' },
      phone: {
        type: 'string',
        pattern: '^0[0-9]{9,12}$',
        errorMessage: {
          pattern: 'Nomor telepon harus dimulai dengan 0 dan berisi 10–13 digit',
        },
      },
      provider: {
        type: 'string', 
        enum: ['EMAIL', 'GOOGLE', 'GITHUB'],
        errorMessage: {
          enum: 'Provider harus salah satu dari EMAIL, GOOGLE, atau GITHUB',
        },
      }
    },
    errorMessage: {
      required: {
        username: 'Username wajib diisi',
        email: 'Email wajib diisi',
        password: 'Password wajib diisi',
        fullName: 'Fullname wajib diisi',
        phone: 'Nomor telepon wajib diisi',
      },
    },
  },
};

