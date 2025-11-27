import { prisma } from '../lib/prisma.js';

const CategoryController = {
  getAll: async (req, res) => {
    try {
      const categories = await prisma.category.findMany({
        orderBy: { id: 'asc' }
      });
      
      res.json({
        success: true,
        message: 'Categories retrieved successfully',
        data: categories
      });
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil kategori'
      });
    }
  },

  getById: async (req, res) => {
    try {
      const category = await prisma.category.findUnique({
        where: { id: parseInt(req.params.id) }
      });
      
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Kategori tidak ditemukan'
        });
      }
      
      res.json({
        success: true,
        message: 'Category retrieved successfully',
        data: category
      });
    } catch (error) {
      console.error('Get category error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil kategori'
      });
    }
  },

  create: async (req, res) => {
    try {
      const { name } = req.body;
      
      if (!name || name.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Nama kategori harus diisi'
        });
      }
      
      if (name.trim().length < 3) {
        return res.status(400).json({
          success: false,
          message: 'Nama kategori minimal 3 karakter'
        });
      }
      
      const existing = await prisma.category.findFirst({
        where: { name: name.trim() }
      });
      
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Nama kategori sudah ada'
        });
      }
      
      const category = await prisma.category.create({
        data: { name: name.trim() }
      });
      
      res.status(201).json({
        success: true,
        message: 'Kategori berhasil dibuat',
        data: category
      });
    } catch (error) {
      console.error('Create category error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat membuat kategori'
      });
    }
  },

  update: async (req, res) => {
    try {
      const { name } = req.body;
      const id = parseInt(req.params.id);
      
      if (!name || name.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Nama kategori harus diisi'
        });
      }
      
      if (name.trim().length < 3) {
        return res.status(400).json({
          success: false,
          message: 'Nama kategori minimal 3 karakter'
        });
      }
      
      const existing = await prisma.category.findUnique({
        where: { id }
      });
      
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Kategori tidak ditemukan'
        });
      }
      
      const duplicate = await prisma.category.findFirst({
        where: { 
          name: name.trim(),
          NOT: { id }
        }
      });
      
      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: 'Nama kategori sudah digunakan'
        });
      }
      
      const category = await prisma.category.update({
        where: { id },
        data: { name: name.trim() }
      });
      
      res.json({
        success: true,
        message: 'Kategori berhasil diupdate',
        data: category
      });
    } catch (error) {
      console.error('Update category error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengupdate kategori'
      });
    }
  },

  delete: async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      const category = await prisma.category.findUnique({
        where: { id }
      });
      
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Kategori tidak ditemukan'
        });
      }
      
      const productsCount = await prisma.product.count({
        where: { categoryId: id }
      });
      
      if (productsCount > 0) {
        return res.status(400).json({
          success: false,
          message: `Kategori tidak dapat dihapus karena masih digunakan oleh ${productsCount} produk`
        });
      }
      
      await prisma.category.delete({
        where: { id }
      });
      
      res.json({
        success: true,
        message: 'Kategori berhasil dihapus'
      });
    } catch (error) {
      console.error('Delete category error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat menghapus kategori'
      });
    }
  }
};

export default CategoryController;