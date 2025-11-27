import { prisma } from '../lib/prisma.js';
import { hash } from 'bcrypt';
import { unlink } from 'fs/promises';
import { existsSync } from 'fs';

const UserController = {
  getAll: async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);
      
      const total = await prisma.user.count();
      
      const users = await prisma.user.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          createdAt: true,
          userProfile: {
            select: {
              fullName: true,
              phone: true,
              address: true,
              photoUrl: true
            }
          }
        }
      });
      
      const totalPages = Math.ceil(total / take);
      
      res.json({
        success: true,
        message: 'Users retrieved successfully',
        data: users,
        meta: {
          page: parseInt(page),
          limit: take,
          totalItems: total,
          totalPages
        },
        links: generatePaginationLinks(req, parseInt(page), totalPages, take)
      });
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil data user'
      });
    }
  },

  getById: async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (id <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID'
        });
      }
      
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          createdAt: true,
          userProfile: {
            select: {
              fullName: true,
              phone: true,
              address: true,
              photoUrl: true
            }
          }
        }
      });
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User tidak ditemukan'
        });
      }
      
      res.json({
        success: true,
        message: 'User retrieved successfully',
        data: user
      });
    } catch (error) {
      console.error('Get user by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil data user'
      });
    }
  },

  create: async (req, res) => {
    try {
      const { email, password, username, role, fullName, phone } = req.body;
      
      if (!email || !password || !username) {
        return res.status(400).json({
          success: false,
          message: 'Email, password, dan username harus diisi'
        });
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Format email tidak valid'
        });
      }
      
      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'Password minimal 6 karakter'
        });
      }
      
      const validRoles = ['admin', 'customer'];
      if (role && !validRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Role harus admin atau customer'
        });
      }
      
      const existingEmail = await prisma.user.findUnique({
        where: { email }
      });
      
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'Email sudah terdaftar'
        });
      }
      
      const existingUsername = await prisma.user.findUnique({
        where: { username }
      });
      
      if (existingUsername) {
        return res.status(400).json({
          success: false,
          message: 'Username sudah digunakan'
        });
      }
      
      const hashedPassword = await hash(password, 10);
      
      const user = await prisma.user.create({
        data: {
          email,
          username,
          password: hashedPassword,
          role: role || 'customer',
          userProfile: {
            create: {
              fullName: fullName || '',
              phone: phone || ''
            }
          }
        },
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          createdAt: true,
          userProfile: {
            select: {
              fullName: true,
              phone: true
            }
          }
        }
      });
      
      res.status(201).json({
        success: true,
        message: 'User berhasil dibuat',
        data: user
      });
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat membuat user'
      });
    }
  },

  update: async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { email, role, fullName, phone, address } = req.body;
      
      if (id <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID'
        });
      }
      
      const user = await prisma.user.findUnique({
        where: { id }
      });
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User tidak ditemukan'
        });
      }
      
      const updateData = {};
      const profileData = {};
      
      if (email && email !== user.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return res.status(400).json({
            success: false,
            message: 'Format email tidak valid'
          });
        }
        
        const emailExists = await prisma.user.findUnique({
          where: { email }
        });
        
        if (emailExists) {
          return res.status(400).json({
            success: false,
            message: 'Email sudah digunakan'
          });
        }
        
        updateData.email = email;
      }
      
      if (role) {
        const validRoles = ['admin', 'customer'];
        if (!validRoles.includes(role)) {
          return res.status(400).json({
            success: false,
            message: 'Role harus admin atau customer'
          });
        }
        updateData.role = role;
      }
      
      if (Object.keys(updateData).length > 0) {
        await prisma.user.update({
          where: { id },
          data: updateData
        });
      }
      
      if (fullName !== undefined) profileData.fullName = fullName;
      if (phone !== undefined) profileData.phone = phone;
      if (address !== undefined) profileData.address = address;
      
      if (Object.keys(profileData).length > 0) {
        await prisma.userProfile.upsert({
          where: { userId: id },
          update: profileData,
          create: {
            userId: id,
            ...profileData
          }
        });
      }
      
      res.json({
        success: true,
        message: 'User berhasil diupdate'
      });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengupdate user'
      });
    }
  },

  delete: async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (id <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID'
        });
      }
      
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          userProfile: {
            select: {
              photoUrl: true
            }
          }
        }
      });
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User tidak ditemukan'
        });
      }
      
      if (user.userProfile?.photoUrl) {
        const photoPath = `.${user.userProfile.photoUrl}`;
        if (existsSync(photoPath)) {
          await unlink(photoPath);
        }
      }
      
      await prisma.userProfile.deleteMany({
        where: { userId: id }
      });
      
      await prisma.user.delete({
        where: { id }
      });
      
      res.json({
        success: true,
        message: 'User berhasil dihapus'
      });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat menghapus user'
      });
    }
  }
};

function generatePaginationLinks(req, page, totalPages, limit) {
  const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`;
  
  const links = {
    self: `${baseUrl}?page=${page}&limit=${limit}`
  };
  
  if (page > 1) {
    links.prev = `${baseUrl}?page=${page - 1}&limit=${limit}`;
  }
  
  if (page < totalPages) {
    links.next = `${baseUrl}?page=${page + 1}&limit=${limit}`;
  }
  
  return links;
}

export default UserController;