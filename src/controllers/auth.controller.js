import jwt from 'jsonwebtoken';
import UserModel from '../models/user.model.js';
import process from 'process';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const otpStorage = new Map();

const AuthController = {
  register: async (req, res) => {
    try {
      const { username, email, password, fullName, phone } = req.body;
      
      const existingEmail = await UserModel.findByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ 
          success: false,
          message: 'Email sudah terdaftar' 
        });
      }
      
      const existingUsername = await UserModel.findByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ 
          success: false,
          message: 'Username sudah terdaftar' 
        });
      }
      
      const newUser = await UserModel.create({ 
        username, 
        email, 
        password,
        fullName: fullName || '',
        phone: phone || '',
        role: 'customer'
      });
      
      const token = jwt.sign(
        { 
          id: newUser.id, 
          email: newUser.email,
          username: newUser.username,
          role: newUser.role
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );
      
      res.status(201).json({
        success: true,
        message: 'Registrasi berhasil',
        data: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
          createdAt: newUser.createdAt
        },
        token
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat registrasi'
      });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      
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
          username: user.username,
          role: user.role || 'customer'
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );
      
      res.json({
        success: true,
        message: 'Login berhasil',
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role || 'customer'
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

  verifyToken: async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Token tidak ditemukan'
        });
      }

      const decoded = jwt.verify(token, JWT_SECRET);
      
      res.json({
        success: true,
        message: 'Token valid',
        data: decoded
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error
      });
    }
  },

  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email harus diisi'
        });
      }
      
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.json({
          success: true,
          message: 'Jika email terdaftar, OTP akan dikirim'
        });
      }
      
      const otp = crypto.randomInt(100000, 999999).toString();
      
      otpStorage.set(email, {
        otp,
        expiresAt: Date.now() + 5 * 60 * 1000,
        attempts: 0
      });
      
      console.log(`OTP for ${email}: ${otp}`);
      
      res.json({
        success: true,
        message: 'OTP telah dikirim ke email Anda',
        ...(process.env.NODE_ENV === 'development' && { otp })
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengirim OTP'
      });
    }
  },

  verifyOTP: async (req, res) => {
    try {
      const { email, otp, newPassword } = req.body;
      
      if (!email || !otp || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Email, OTP, dan password baru harus diisi'
        });
      }
      
      const otpData = otpStorage.get(email);
      
      if (!otpData) {
        return res.status(400).json({
          success: false,
          message: 'OTP tidak valid atau sudah kadaluarsa'
        });
      }
      
      if (Date.now() > otpData.expiresAt) {
        otpStorage.delete(email);
        return res.status(400).json({
          success: false,
          message: 'OTP sudah kadaluarsa'
        });
      }
      
      if (otpData.attempts >= 3) {
        otpStorage.delete(email);
        return res.status(400).json({
          success: false,
          message: 'Terlalu banyak percobaan. Silakan minta OTP baru'
        });
      }
      
      if (otpData.otp !== otp) {
        otpData.attempts += 1;
        return res.status(400).json({
          success: false,
          message: 'OTP tidak valid'
        });
      }
      
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User tidak ditemukan'
        });
      }
      
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
        message: 'Terjadi kesalahan saat verifikasi OTP'
      });
    }
  }
};

export default AuthController;