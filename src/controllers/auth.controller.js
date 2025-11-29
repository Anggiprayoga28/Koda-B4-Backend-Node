import jwt from 'jsonwebtoken';
import UserModel from '../models/user.model.js';
import crypto from 'crypto';
import { prisma } from '../lib/prisma.js';
import process from 'process';
import EmailService from '../services/email.service.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const otpStorage = new Map();

const AuthController = {
  register: async (req, res) => {
    try {
      const data = (req.body && Object.keys(req.body).length > 0) ? req.body : req.query;
      const { email, password, fullName, phone, role } = data;
      
      const userRole = role || 'customer';
      if (!['customer', 'admin'].includes(userRole)) {
        return res.status(400).json({
          success: false,
          message: 'Role tidak valid. Gunakan "customer" atau "admin"'
        });
      }
      
      if (userRole === 'admin') {
        try {
          const adminCount = await prisma.user.count({
            where: { role: 'admin' }
          });
          
          console.log(`Admin count in database: ${adminCount}`);
          
          if (adminCount > 0) {
            const token = req.headers.authorization?.split(' ')[1];
            
            if (!token) {
              return res.status(403).json({
                success: false,
                message: 'Sudah ada admin. Login sebagai admin untuk membuat admin baru.'
              });
            }
            
            try {
              const decoded = jwt.verify(token, JWT_SECRET);
              if (decoded.role !== 'admin') {
                return res.status(403).json({
                  success: false,
                  message: 'Hanya admin yang bisa membuat akun admin'
                });
              }
            } catch (error) {
              return res.status(401).json({
                success: false,
                message: 'Token tidak valid atau expired'
              });
            }
          } else {
            console.log('No admin exists. Allowing first admin registration without token.');
          }
        } catch (error) {
          console.error('Error checking admin:', error);
          return res.status(500).json({
            success: false,
            message: 'Error checking admin status'
          });
        }
      }
      
      const existingEmail = await UserModel.findByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ 
          success: false,
          message: 'Email sudah terdaftar' 
        });
      }
      
      const newUser = await UserModel.create({ 
        email, 
        password,
        fullName: fullName || '',
        phone: phone || '',
        role: userRole
      });
      
      const token = jwt.sign(
        { 
          id: newUser.id, 
          email: newUser.email,
          role: newUser.role
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );
      
      res.status(201).json({
        success: true,
        message: userRole === 'admin' ? 'Admin berhasil didaftarkan' : 'Registrasi berhasil',
        data: {
          id: newUser.id,
          email: newUser.email,
          role: newUser.role,
          profile: newUser.profile
        },
        token
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat registrasi',
        error: error.message
      });
    }
  },

  login: async (req, res) => {
    try {
      const data = (req.body && Object.keys(req.body).length > 0) ? req.body : req.query;
      const { email, password } = data;
      
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Email atau password salah'
        });
      }
      
      const isPasswordValid = await UserModel.verifyPassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Email atau password salah'
        });
      }
      
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email,
          role: user.role
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );
      
      res.json({
        success: true,
        message: 'Login berhasil',
        data: {
          id: user.id,
          email: user.email,
          role: user.role,
          profile: user.profile
        },
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat login'
      });
    }
  },

  forgotPassword: async (req, res) => {
    try {
      const data = (req.body && Object.keys(req.body).length > 0) ? req.body : req.query;
      const { email } = data;
      
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Email tidak terdaftar'
        });
      }
      
      const otp = crypto.randomInt(100000, 999999).toString();
      
      otpStorage.set(email, {
        otp,
        expiresAt: Date.now() + 5 * 60 * 1000,
        attempts: 0
      });
      
      console.log(`OTP for ${email}: ${otp}`);
      
      try {
        await EmailService.sendOTP(email, otp);
        
        res.json({
          success: true,
          message: 'OTP telah dikirim ke email Anda',
          otp: process.env.NODE_ENV === 'development' ? otp : undefined
        });
      } catch (emailError) {
        otpStorage.delete(email);
        
        return res.status(500).json({
          success: false,
          message: 'Gagal mengirim OTP ke email. Pastikan konfigurasi SMTP sudah benar.',
          error: process.env.NODE_ENV === 'development' ? emailError.message : undefined
        });
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan'
      });
    }
  },

  verifyOTP: async (req, res) => {
    try {
      const data = (req.body && Object.keys(req.body).length > 0) ? req.body : req.query;
      const { email, otp, newPassword } = data;
      
      const storedOTP = otpStorage.get(email);
      
      if (!storedOTP) {
        return res.status(400).json({
          success: false,
          message: 'OTP tidak ditemukan atau expired'
        });
      }
      
      if (Date.now() > storedOTP.expiresAt) {
        otpStorage.delete(email);
        return res.status(400).json({
          success: false,
          message: 'OTP sudah expired'
        });
      }
      
      if (storedOTP.attempts >= 3) {
        otpStorage.delete(email);
        return res.status(400).json({
          success: false,
          message: 'Terlalu banyak percobaan. Silakan request OTP baru'
        });
      }
      
      if (storedOTP.otp !== otp) {
        storedOTP.attempts++;
        return res.status(400).json({
          success: false,
          message: 'OTP salah'
        });
      }
      
      const user = await UserModel.findByEmail(email);
      await UserModel.updatePassword(user.id, newPassword);
      
      otpStorage.delete(email);
      
      res.json({
        success: true,
        message: 'Password berhasil direset'
      });
    } catch (error) {
      console.error('Verify OTP error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan'
      });
    }
  }
};

export default AuthController;