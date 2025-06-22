import prisma from "../config/DBConfig.js";
import { AppError } from "../utils/mainUtils.js";

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
      return [null, new AppError("Email atau username sudah terdaftar", 409)];
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

    return [user, null];
  } catch (error) {
    throw new AppError(error.message || "Terjadi kesalahan saat registrasi", 500);
  }
};
