import { prisma } from '../lib/prisma.js';
import { unlink } from 'fs/promises';
import { existsSync } from 'fs';

const ProductController = {
  getAll: async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      
      const currentPage = parseInt(page);
      const itemsPerPage = parseInt(limit);
      const skip = (currentPage - 1) * itemsPerPage;
      
      const where = {
        isActive: true
      };
      
      const totalCount = await prisma.product.count({ where });
      
      const products = await prisma.product.findMany({
        where,
        skip,
        take: itemsPerPage,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          images: {
            take: 1,
            orderBy: { createdAt: 'desc' }
          }
        }
      });
      
      const productsWithUrls = products.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        stock: p.stock,
        categoryId: p.categoryId,
        isFlashSale: p.isFlashSale,
        isFavorite: p.isFavorite,
        isBuy1get1: p.isBuy1get1,
        isActive: p.isActive,
        imageUrl: p.imageUrl 
          ? `${req.protocol}://${req.get('host')}${p.imageUrl}`
          : (p.images && p.images.length > 0 
              ? `${req.protocol}://${req.get('host')}${p.images[0].imageUrl}`
              : null),
        createdAt: p.createdAt
      }));
      
      const totalPages = Math.ceil(totalCount / itemsPerPage);
      const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}`;
      
      const links = {
        self: `${baseUrl}?page=${currentPage}&limit=${itemsPerPage}`
      };
      
      if (currentPage > 1) {
        links.prev = `${baseUrl}?page=${currentPage - 1}&limit=${itemsPerPage}`;
      }
      
      if (currentPage < totalPages) {
        links.next = `${baseUrl}?page=${currentPage + 1}&limit=${itemsPerPage}`;
      }
      
      res.json({
        success: true,
        message: 'Daftar produk berhasil diambil',
        data: productsWithUrls,
        pagination: {
          currentPage,
          totalPages,
          totalItems: totalCount,
          itemsPerPage,
          hasNextPage: currentPage < totalPages,
          hasPrevPage: currentPage > 1
        },
        _links: links
      });
    } catch (error) {
      console.error('Get all products error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil data produk',
        error: error.message
      });
    }
  },

  getById: async (req, res) => {
    try {
      const product = await prisma.product.findUnique({
        where: { id: parseInt(req.params.id) },
        include: {
          images: true
        }
      });
      
      if (!product) {
        return res.status(404).json({ 
          success: false,
          message: 'Produk tidak ditemukan' 
        });
      }
      
      const productWithUrl = {
        ...product,
        imageUrl: product.imageUrl
          ? `${req.protocol}://${req.get('host')}${product.imageUrl}`
          : (product.images && product.images.length > 0
              ? `${req.protocol}://${req.get('host')}${product.images[0].imageUrl}`
              : null),
        images: product.images.map(img => ({
          ...img,
          imageUrl: `${req.protocol}://${req.get('host')}${img.imageUrl}`
        }))
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
        message: 'Terjadi kesalahan saat mengambil data produk',
        error: error.message
      });
    }
  },

  getFavoriteProducts: async (req, res) => {
    try {
      const products = await prisma.product.findMany({
        where: { 
          isFavorite: true,
          isActive: true 
        },
        include: {
          images: {
            take: 1
          }
        }
      });
      
      const productsWithUrls = products.map(p => ({
        ...p,
        imageUrl: p.imageUrl
          ? `${req.protocol}://${req.get('host')}${p.imageUrl}`
          : (p.images && p.images.length > 0
              ? `${req.protocol}://${req.get('host')}${p.images[0].imageUrl}`
              : null)
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
        message: 'Terjadi kesalahan saat mengambil produk favorit',
        error: error.message
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
      
      const where = { isActive: true };
      
      if (categoryId) where.categoryId = parseInt(categoryId);
      if (isFlashSale !== undefined) where.isFlashSale = isFlashSale === 'true';
      if (isFavorite !== undefined) where.isFavorite = isFavorite === 'true';
      if (isBuy1Get1 !== undefined) where.isBuy1get1 = isBuy1Get1 === 'true';
      
      if (minPrice || maxPrice) {
        where.price = {};
        if (minPrice) where.price.gte = parseInt(minPrice);
        if (maxPrice) where.price.lte = parseInt(maxPrice);
      }
      
      if (search) {
        where.OR = [
          { name: { contains: search } },
          { description: { contains: search } }
        ];
      }
      
      const products = await prisma.product.findMany({
        where,
        include: {
          images: {
            take: 1
          }
        }
      });
      
      const productsWithUrls = products.map(p => ({
        ...p,
        imageUrl: p.imageUrl
          ? `${req.protocol}://${req.get('host')}${p.imageUrl}`
          : (p.images && p.images.length > 0
              ? `${req.protocol}://${req.get('host')}${p.images[0].imageUrl}`
              : null)
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
        message: 'Terjadi kesalahan saat memfilter produk',
        error: error.message
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
      
      const productData = {
        name,
        description: description || '',
        categoryId: parseInt(categoryId),
        price: parseInt(price),
        stock: stock ? parseInt(stock) : 0,
        isFlashSale: isFlashSale === 'true' || isFlashSale === true,
        isFavorite: isFavorite === 'true' || isFavorite === true,
        isBuy1get1: isBuy1Get1 === 'true' || isBuy1Get1 === true,
        isActive: true
      };
      
      if (req.file) {
        const imagePath = `/uploads/${req.file.filename}`;
        productData.imageUrl = imagePath;
        productData.images = {
          create: [{
            imageUrl: imagePath,
            isPrimary: true,
            displayOrder: 0
          }]
        };
      }
      
      const newProduct = await prisma.product.create({
        data: productData,
        include: {
          images: true
        }
      });
      
      const productWithUrl = {
        ...newProduct,
        imageUrl: newProduct.imageUrl
          ? `${req.protocol}://${req.get('host')}${newProduct.imageUrl}`
          : null
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
        message: 'Terjadi kesalahan saat membuat produk',
        error: error.message
      });
    }
  },

  update: async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      
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
      
      const existingProduct = await prisma.product.findUnique({
        where: { id: productId },
        include: { images: true }
      });
      
      if (!existingProduct) {
        return res.status(404).json({ 
          success: false,
          message: 'Produk tidak ditemukan' 
        });
      }
      
      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (categoryId !== undefined) updateData.categoryId = parseInt(categoryId);
      if (price !== undefined) updateData.price = parseInt(price);
      if (stock !== undefined) updateData.stock = parseInt(stock);
      if (isFlashSale !== undefined) updateData.isFlashSale = isFlashSale === 'true' || isFlashSale === true;
      if (isFavorite !== undefined) updateData.isFavorite = isFavorite === 'true' || isFavorite === true;
      if (isBuy1Get1 !== undefined) updateData.isBuy1get1 = isBuy1Get1 === 'true' || isBuy1Get1 === true;
      if (isActive !== undefined) updateData.isActive = isActive === 'true' || isActive === true;
      
      if (req.file) {
        const imagePath = `/uploads/${req.file.filename}`;
        
        if (existingProduct.imageUrl) {
          const oldImagePath = `.${existingProduct.imageUrl}`;
          if (existsSync(oldImagePath)) {
            await unlink(oldImagePath);
          }
        }
        
        if (existingProduct.images && existingProduct.images.length > 0) {
          for (const img of existingProduct.images) {
            const oldPath = `.${img.imageUrl}`;
            if (existsSync(oldPath)) {
              await unlink(oldPath);
            }
          }
          
          await prisma.productImage.deleteMany({
            where: { productId }
          });
        }
        
        updateData.imageUrl = imagePath;
        updateData.images = {
          create: [{
            imageUrl: imagePath,
            isPrimary: true,
            displayOrder: 0
          }]
        };
      }
      
      const updatedProduct = await prisma.product.update({
        where: { id: productId },
        data: updateData,
        include: {
          images: true
        }
      });
      
      const productWithUrl = {
        ...updatedProduct,
        imageUrl: updatedProduct.imageUrl
          ? `${req.protocol}://${req.get('host')}${updatedProduct.imageUrl}`
          : null
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
        message: 'Terjadi kesalahan saat mengupdate produk',
        error: error.message
      });
    }
  },

  delete: async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: { images: true }
      });
      
      if (!product) {
        return res.status(404).json({ 
          success: false,
          message: 'Produk tidak ditemukan' 
        });
      }
      
      if (product.imageUrl) {
        const imagePath = `.${product.imageUrl}`;
        if (existsSync(imagePath)) {
          await unlink(imagePath);
        }
      }
      
      if (product.images && product.images.length > 0) {
        for (const img of product.images) {
          const imgPath = `.${img.imageUrl}`;
          if (existsSync(imgPath)) {
            await unlink(imgPath);
          }
        }
      }
      
      
      await prisma.productImage.deleteMany({
        where: { productId }
      });
      
      await prisma.productReview.deleteMany({
        where: { productId }
      });
      
      await prisma.promoProduct.deleteMany({
        where: { productId }
      });
      
      if (prisma.productDetail) {
        await prisma.productDetail.deleteMany({
          where: { productId }
        });
      }
      
      const cartCount = await prisma.cartItem.count({
        where: { productId }
      });
      
      if (cartCount > 0) {
        return res.status(400).json({
          success: false,
          message: `Produk tidak bisa dihapus karena masih ada di ${cartCount} keranjang belanja. Hapus dari keranjang terlebih dahulu.`
        });
      }
      
      const orderCount = await prisma.orderItem.count({
        where: { productId }
      });
      
      if (orderCount > 0) {
        return res.status(400).json({
          success: false,
          message: `Produk tidak bisa dihapus karena sudah ada ${orderCount} pesanan. Sebaiknya set isActive=false daripada menghapus.`
        });
      }
      
      await prisma.product.delete({
        where: { id: productId }
      });
      
      res.json({
        success: true,
        message: 'Produk berhasil dihapus'
      });
    } catch (error) {
      console.error('Delete product error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat menghapus produk',
        error: error.message
      });
    }
  }
};

export default ProductController;