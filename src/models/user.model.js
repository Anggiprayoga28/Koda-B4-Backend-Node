import { prisma } from '../lib/prisma.js';
import { hash, compare } from 'bcrypt';

const UserModel = {
  create: async (userData) => {
    const hashedPassword = await hash(userData.password, 10);
    
    const newUser = await prisma.user.create({
      data: {
        email: userData.email,
        password: hashedPassword,
        role: userData.role || 'customer',
        profile: {
          create: {
            fullName: userData.fullName || '',
            phone: userData.phone || '',
            address: userData.address || ''
          }
        }
      },
      include: {
        profile: true
      }
    });
    
    return newUser;
  },

  findByEmail: async (email) => {
    return await prisma.user.findUnique({
      where: { email },
      include: {
        profile: true
      }
    });
  },

  findById: async (id) => {
    return await prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: {
        profile: true
      }
    });
  },

  getAll: async (page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    
    const users = await prisma.user.findMany({
      skip,
      take: limit,
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        profile: {
          select: {
            fullName: true,
            phone: true,
            address: true,
            photoUrl: true
          }
        }
      }
    });
    
    const total = await prisma.user.count();
    
    return { users, total };
  },

  verifyPassword: async (plainPassword, hashedPassword) => {
    return await compare(plainPassword, hashedPassword);
  },

  updatePassword: async (userId, newPassword) => {
    const hashedPassword = await hash(newPassword, 10);
    return await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });
  },

  update: async (id, userData) => {
    return await prisma.user.update({
      where: { id: parseInt(id) },
      data: userData,
      include: {
        profile: true
      }
    });
  },

  updateProfile: async (userId, profileData) => {
    return await prisma.userProfile.upsert({
      where: { userId: parseInt(userId) },
      update: profileData,
      create: {
        userId: parseInt(userId),
        ...profileData
      }
    });
  },

  delete: async (id) => {
    return await prisma.user.delete({
      where: { id: parseInt(id) }
    });
  },

  emailExists: async (email, excludeId = null) => {
    const where = { email };
    if (excludeId) {
      where.id = { not: parseInt(excludeId) };
    }
    const user = await prisma.user.findUnique({ where: { email } });
    return !!user;
  }
};

export default UserModel;