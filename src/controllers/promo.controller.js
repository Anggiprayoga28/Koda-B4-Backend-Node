import { prisma } from '../lib/prisma.js';

const PromoController = {
  getAll: async (req, res) => {
    try {
      const promos = await prisma.promo.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' }
      });
      
      res.json({
        success: true,
        message: 'Promos retrieved successfully',
        data: promos
      });
    } catch (error) {
      console.error('Get promos error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get promos'
      });
    }
  },

  getByCode: async (req, res) => {
    try {
      const { code } = req.params;
      
      const promo = await prisma.promo.findFirst({
        where: { 
          code: code.toUpperCase(),
          isActive: true
        }
      });
      
      if (!promo) {
        return res.status(404).json({
          success: false,
          message: 'Promo tidak ditemukan atau sudah tidak aktif'
        });
      }
      
      res.json({
        success: true,
        message: 'Promo retrieved successfully',
        data: promo
      });
    } catch (error) {
      console.error('Get promo error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil promo'
      });
    }
  },

  create: async (req, res) => {
    try {
      const data = (req.body && Object.keys(req.body).length > 0) ? req.body : req.query;
      const { title, description, code, discountPercentage, discount, startDate, endDate } = data;
      
      if (!title) {
        return res.status(400).json({
          success: false,
          message: 'Title harus diisi'
        });
      }
      
      if (!code) {
        return res.status(400).json({
          success: false,
          message: 'Code harus diisi'
        });
      }
      
      const discountValue = discountPercentage || discount;
      if (!discountValue) {
        return res.status(400).json({
          success: false,
          message: 'discountPercentage harus diisi'
        });
      }
      
      if (!startDate) {
        return res.status(400).json({
          success: false,
          message: 'startDate harus diisi (format: YYYY-MM-DD)'
        });
      }
      
      if (!endDate) {
        return res.status(400).json({
          success: false,
          message: 'endDate harus diisi (format: YYYY-MM-DD)'
        });
      }
      
      const existing = await prisma.promo.findFirst({
        where: { code: code.toUpperCase() }
      });
      
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Kode promo sudah digunakan'
        });
      }
      
      const promo = await prisma.promo.create({
        data: {
          title,
          description: description || '',
          code: code.toUpperCase(),
          discountPercentage: parseInt(discountValue),
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          isActive: true
        }
      });
      
      res.status(201).json({
        success: true,
        message: 'Promo berhasil dibuat',
        data: promo
      });
    } catch (error) {
      console.error('Create promo error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat membuat promo'
      });
    }
  },

  update: async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = (req.body && Object.keys(req.body).length > 0) ? req.body : req.query;
      const { title, description, code, discountPercentage, startDate, endDate, isActive } = data;
      
      const promo = await prisma.promo.findUnique({
        where: { id }
      });
      
      if (!promo) {
        return res.status(404).json({
          success: false,
          message: 'Promo tidak ditemukan'
        });
      }
      
      if (code && code.toUpperCase() !== promo.code) {
        const existing = await prisma.promo.findFirst({
          where: { 
            code: code.toUpperCase(),
            NOT: { id }
          }
        });
        
        if (existing) {
          return res.status(400).json({
            success: false,
            message: 'Kode promo sudah digunakan'
          });
        }
      }
      
      const updateData = {};
      if (title) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (code) updateData.code = code.toUpperCase();
      if (discountPercentage) updateData.discountPercentage = parseInt(discountPercentage);
      if (startDate) updateData.startDate = new Date(startDate);
      if (endDate) updateData.endDate = new Date(endDate);
      if (isActive !== undefined) updateData.isActive = isActive === 'true' || isActive === true;
      
      const updatedPromo = await prisma.promo.update({
        where: { id },
        data: updateData
      });
      
      res.json({
        success: true,
        message: 'Promo berhasil diupdate',
        data: updatedPromo
      });
    } catch (error) {
      console.error('Update promo error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengupdate promo'
      });
    }
  },

  delete: async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      const promo = await prisma.promo.findUnique({
        where: { id }
      });
      
      if (!promo) {
        return res.status(404).json({
          success: false,
          message: 'Promo tidak ditemukan'
        });
      }
      
      await prisma.promo.delete({
        where: { id }
      });
      
      res.json({
        success: true,
        message: 'Promo berhasil dihapus'
      });
    } catch (error) {
      console.error('Delete promo error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat menghapus promo'
      });
    }
  }
};

export default PromoController;