import { prisma } from '../lib/prisma.js';
import { hash, compare } from 'bcrypt';
import { unlink } from 'fs/promises';
import { existsSync } from 'fs';

const ProfileController = {
  getProfile: async (req, res) => {
    try {
      const userId = req.user.id;
      
      const user = await prisma.user.findUnique({
        where: { id: userId },
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
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Profil tidak ditemukan'
        });
      }
      
      res.json({
        success: true,
        message: 'Profile retrieved successfully',
        data: {
          id: user.id,
          email: user.email,
          role: user.role,
          fullName: user.profile?.fullName || '',
          phone: user.profile?.phone || '',
          address: user.profile?.address || '',
          photoUrl: user.profile?.photoUrl ? `${req.protocol}://${req.get('host')}${user.profile.photoUrl}` : null,
          createdAt: user.createdAt
        }
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil profil',
        error: error.message
      });
    }
  },

  updateProfile: async (req, res) => {
    try {
      const userId = req.user.id;
      const { fullName, phone, address, oldPassword, newPassword, confirmPassword } = req.body;
      
      if (fullName && fullName.length < 3) {
        return res.status(400).json({
          success: false,
          message: 'Nama lengkap minimal 3 karakter'
        });
      }
      
      if (phone && !isValidPhone(phone)) {
        return res.status(400).json({
          success: false,
          message: 'Format nomor telepon tidak valid'
        });
      }
      
      if (oldPassword || newPassword || confirmPassword) {
        if (!oldPassword || !newPassword || !confirmPassword) {
          return res.status(400).json({
            success: false,
            message: 'Semua field password harus diisi untuk mengganti password'
          });
        }
        
        if (newPassword.length < 6) {
          return res.status(400).json({
            success: false,
            message: 'Password baru minimal 6 karakter'
          });
        }
        
        if (newPassword !== confirmPassword) {
          return res.status(400).json({
            success: false,
            message: 'Password baru dan konfirmasi tidak cocok'
          });
        }
        
        if (oldPassword === newPassword) {
          return res.status(400).json({
            success: false,
            message: 'Password baru harus berbeda dengan password lama'
          });
        }
        
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { password: true }
        });
        
        const isValidPassword = await compare(oldPassword, user.password);
        if (!isValidPassword) {
          return res.status(400).json({
            success: false,
            message: 'Password lama tidak valid'
          });
        }
        
        const hashedPassword = await hash(newPassword, 10);
        await prisma.user.update({
          where: { id: userId },
          data: { password: hashedPassword }
        });
      }
      
      let photoUrl;
      if (req.file) {
        photoUrl = `/uploads/${req.file.filename}`;
        
        const oldProfile = await prisma.userProfile.findUnique({
          where: { userId },
          select: { photoUrl: true }
        });
        
        if (oldProfile?.photoUrl) {
          const oldPhotoPath = `.${oldProfile.photoUrl}`;
          if (existsSync(oldPhotoPath)) {
            await unlink(oldPhotoPath);
          }
        }
      }
      
      const profileData = {};
      if (fullName !== undefined) profileData.fullName = fullName;
      if (phone !== undefined) profileData.phone = phone;
      if (address !== undefined) profileData.address = address;
      if (photoUrl) profileData.photoUrl = photoUrl;
      
      await prisma.userProfile.upsert({
        where: { userId },
        update: profileData,
        create: {
          userId,
          ...profileData
        }
      });
      
      const responseData = {
        success: true,
        message: 'Profile updated successfully'
      };
      
      if (photoUrl) {
        responseData.data = {
          photoUrl: `${req.protocol}://${req.get('host')}${photoUrl}`
        };
      }
      
      res.json(responseData);
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengupdate profil',
        error: error.message
      });
    }
  }
};

function isValidPhone(phone) {
  if (!phone) return true;
  const phoneRegex = /^[\d+\-\s()]+$/;
  return phoneRegex.test(phone) && phone.length >= 10;
}

export default ProfileController;