import ProductModel from '../models/product.model.js';
import { unlink } from 'fs/promises';
import { existsSync } from 'fs';

const ProductController = {
  getAll: async (req, res) => {
    try {
      const { search, minPrice, maxPrice, sortBy, order, page = 1, limit = 10 } = req.query;
      
      const products = await ProductModel.getAll({
        search,
        minPrice,
        maxPrice,
        sortBy,
        order,
        page: parseInt(page),
        limit: parseInt(limit)
      });
      
      const productsWithUrls = products.map(p => ({
        ...p,
        imageUrl: p.image ? `${req.protocol}://${req.get('host')}${p.image}` : null
      }));
      
      res.json({
        success: true,
        message: 'Daftar produk berhasil diambil',
        total: productsWithUrls.length,
        data: productsWithUrls
      });
    } catch (error) {
      console.error('Get all products error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil data produk'
      });
    }
  },

  getById: async (req, res) => {
    try {
      const product = await ProductModel.findById(req.params.id);
      
      if (!product) {
        return res.status(404).json({ 
          success: false,
          message: 'Produk tidak ditemukan' 
        });
      }
      
      const productWithUrl = {
        ...product,
        imageUrl: product.image ? `${req.protocol}://${req.get('host')}${product.image}` : null
      };
      
      res.json({
        success: true,
        message: 'Produk berhasil diambil',
        data: productWithUrl
      });
    } catch (error) {
      console.error('Get product by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil data produk'
      });
    }
  },

  getFavoriteProducts: async (req, res) => {
    try {
      const products = await ProductModel.getFavorites();
      
      const productsWithUrls = products.map(p => ({
        ...p,
        imageUrl: p.image ? `${req.protocol}://${req.get('host')}${p.image}` : null
      }));
      
      res.json({
        success: true,
        message: 'Produk favorit berhasil diambil',
        data: productsWithUrls
      });
    } catch (error) {
      console.error('Get favorite products error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil produk favorit'
      });
    }
  },

  filterProducts: async (req, res) => {
    try {
      const { 
        categoryId, 
        isFlashSale, 
        isFavorite, 
        isBuy1Get1,
        minPrice, 
        maxPrice,
        search 
      } = req.query;
      
      const filters = {};
      if (categoryId) filters.categoryId = parseInt(categoryId);
      if (isFlashSale) filters.isFlashSale = isFlashSale === 'true';
      if (isFavorite) filters.isFavorite = isFavorite === 'true';
      if (isBuy1Get1) filters.isBuy1Get1 = isBuy1Get1 === 'true';
      if (minPrice) filters.minPrice = parseFloat(minPrice);
      if (maxPrice) filters.maxPrice = parseFloat(maxPrice);
      if (search) filters.search = search;
      
      const products = await ProductModel.filterProducts(filters);
      
      const productsWithUrls = products.map(p => ({
        ...p,
        imageUrl: p.image ? `${req.protocol}://${req.get('host')}${p.image}` : null
      }));
      
      res.json({
        success: true,
        message: 'Produk berhasil difilter',
        total: productsWithUrls.length,
        data: productsWithUrls
      });
    } catch (error) {
      console.error('Filter products error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat memfilter produk'
      });
    }
  },

  create: async (req, res) => {
    try {
      const { 
        name, 
        description, 
        categoryId, 
        price, 
        stock,
        isFlashSale,
        isFavorite,
        isBuy1Get1
      } = req.body;
      
      if (!name || !categoryId || !price) {
        return res.status(400).json({
          success: false,
          message: 'Nama, kategori, dan harga harus diisi'
        });
      }
      
      const newProduct = await ProductModel.create({
        name,
        description: description || '',
        categoryId: parseInt(categoryId),
        price: parseFloat(price),
        stock: stock ? parseInt(stock) : 0,
        image: req.file ? `/uploads/${req.file.filename}` : null,
        isFlashSale: isFlashSale === 'true' || isFlashSale === true,
        isFavorite: isFavorite === 'true' || isFavorite === true,
        isBuy1Get1: isBuy1Get1 === 'true' || isBuy1Get1 === true,
        isActive: true
      });
      
      const productWithUrl = {
        ...newProduct,
        imageUrl: newProduct.image ? `${req.protocol}://${req.get('host')}${newProduct.image}` : null
      };
      
      res.status(201).json({
        success: true,
        message: 'Produk berhasil dibuat',
        data: productWithUrl
      });
    } catch (error) {
      console.error('Create product error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat membuat produk'
      });
    }
  },

  update: async (req, res) => {
    try {
      const { 
        name, 
        description, 
        categoryId, 
        price, 
        stock,
        isFlashSale,
        isFavorite,
        isBuy1Get1,
        isActive
      } = req.body;
      
      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (categoryId !== undefined) updateData.categoryId = parseInt(categoryId);
      if (price !== undefined) updateData.price = parseFloat(price);
      if (stock !== undefined) updateData.stock = parseInt(stock);
      if (isFlashSale !== undefined) updateData.isFlashSale = isFlashSale === 'true' || isFlashSale === true;
      if (isFavorite !== undefined) updateData.isFavorite = isFavorite === 'true' || isFavorite === true;
      if (isBuy1Get1 !== undefined) updateData.isBuy1Get1 = isBuy1Get1 === 'true' || isBuy1Get1 === true;
      if (isActive !== undefined) updateData.isActive = isActive === 'true' || isActive === true;
      
      if (req.file) {
        const oldProduct = await ProductModel.findById(req.params.id);
        if (oldProduct && oldProduct.image) {
          const oldImagePath = `.${oldProduct.image}`;
          if (existsSync(oldImagePath)) {
            await unlink(oldImagePath);
          }
        }
        updateData.image = `/uploads/${req.file.filename}`;
      }
      
      const updatedProduct = await ProductModel.update(req.params.id, updateData);
      
      if (!updatedProduct) {
        return res.status(404).json({ 
          success: false,
          message: 'Produk tidak ditemukan' 
        });
      }
      
      const productWithUrl = {
        ...updatedProduct,
        imageUrl: updatedProduct.image ? `${req.protocol}://${req.get('host')}${updatedProduct.image}` : null
      };
      
      res.json({
        success: true,
        message: 'Produk berhasil diupdate',
        data: productWithUrl
      });
    } catch (error) {
      console.error('Update product error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengupdate produk'
      });
    }
  },

  delete: async (req, res) => {
    try {
      const product = await ProductModel.findById(req.params.id);
      
      if (!product) {
        return res.status(404).json({ 
          success: false,
          message: 'Produk tidak ditemukan' 
        });
      }
      
      if (product.image) {
        const imagePath = `.${product.image}`;
        if (existsSync(imagePath)) {
          await unlink(imagePath);
        }
      }
      
      const deleted = await ProductModel.delete(req.params.id);
      
      if (!deleted) {
        return res.status(404).json({ 
          success: false,
          message: 'Produk tidak ditemukan' 
        });
      }
      
      res.json({
        success: true,
        message: 'Produk berhasil dihapus'
      });
    } catch (error) {
      console.error('Delete product error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat menghapus produk'
      });
    }
  }
};

export default ProductController;