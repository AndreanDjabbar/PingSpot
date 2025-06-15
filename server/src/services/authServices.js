import prisma from "../config/DBConfig.js";

export const registerService = async ({
  username,
  email,
  password,
  fullName,
  phone,
  provider="EMAIL",
  providerId=null
}) => {
  try {
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existing) {
      throw new Error("Username atau email sudah digunakan");
    }

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password,
        fullName,
        phone,
        provider,
        providerId,
        isVerified: false
      },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        phone: true,
        provider: true,
        providerId: true,
        isVerified: true,
        createdAt: true
      }
    });

    return user;
  } catch (error) {
    throw new Error(error.message || "Terjadi kesalahan saat registrasi");
  }
};
