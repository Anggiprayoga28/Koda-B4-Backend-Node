import { prisma } from '../lib/prisma.js';

const CartController = {
  getCart: async (req, res) => {
    try {
      const userId = req.user.id;
      
      const cartItems = await prisma.cartItem.findMany({
        where: { userId },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              stock: true,
              image: true,
              isActive: true
            }
          },
          size: true,
          temperature: true
        },
        orderBy: { createdAt: 'desc' }
      });
      
      let subtotal = 0;
      const items = cartItems
        .filter(item => item.product.isActive)
        .map(item => {
          const sizeAdjustment = item.size?.priceAdjustment || 0;
          const temperaturePrice = item.temperature?.price || 0;
          const itemPrice = (item.product.price + sizeAdjustment + temperaturePrice) * item.quantity;
          subtotal += itemPrice;
          
          return {
            id: item.id,
            productId: item.product.id,
            name: item.product.name,
            basePrice: item.product.price,
            quantity: item.quantity,
            size: item.size?.name || '',
            sizeAdjustment,
            temperature: item.temperature?.name || '',
            temperaturePrice,
            subtotal: itemPrice,
            imageUrl: item.product.image ? `${req.protocol}://${req.get('host')}${item.product.image}` : null,
            stock: item.product.stock
          };
        });
      
      res.json({
        success: true,
        message: 'Cart retrieved successfully',
        data: {
          items,
          subtotal
        }
      });
    } catch (error) {
      console.error('Get cart error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil keranjang'
      });
    }
  },

  addToCart: async (req, res) => {
    try {
      const userId = req.user.id;
      const { productId, quantity, sizeId, temperatureId } = req.body;
      
      if (!productId || !quantity) {
        return res.status(400).json({
          success: false,
          message: 'Product ID dan quantity harus diisi'
        });
      }
      
      const product = await prisma.product.findUnique({
        where: { id: parseInt(productId) }
      });
      
      if (!product || !product.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Produk tidak ditemukan atau tidak aktif'
        });
      }
      
      if (product.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: `Stok tidak cukup. Tersedia: ${product.stock}`
        });
      }
      
      const existingItem = await prisma.cartItem.findFirst({
        where: {
          userId,
          productId: parseInt(productId),
          sizeId: sizeId ? parseInt(sizeId) : null,
          temperatureId: temperatureId ? parseInt(temperatureId) : null
        }
      });
      
      let cartItem;
      
      if (existingItem) {
        // Update quantity
        const newQuantity = existingItem.quantity + parseInt(quantity);
        
        if (product.stock < newQuantity) {
          return res.status(400).json({
            success: false,
            message: `Stok tidak cukup. Tersedia: ${product.stock}, di keranjang: ${existingItem.quantity}`
          });
        }
        
        cartItem = await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: newQuantity }
        });
        
        return res.json({
          success: true,
          message: 'Keranjang berhasil diupdate',
          data: {
            cartItemId: cartItem.id,
            quantity: cartItem.quantity
          }
        });
      } else {
        cartItem = await prisma.cartItem.create({
          data: {
            userId,
            productId: parseInt(productId),
            quantity: parseInt(quantity),
            sizeId: sizeId ? parseInt(sizeId) : null,
            temperatureId: temperatureId ? parseInt(temperatureId) : null
          }
        });
        
        return res.status(201).json({
          success: true,
          message: 'Berhasil ditambahkan ke keranjang',
          data: {
            cartItemId: cartItem.id,
            quantity: cartItem.quantity
          }
        });
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat menambahkan ke keranjang'
      });
    }
  },

  updateCartItem: async (req, res) => {
    try {
      const userId = req.user.id;
      const cartItemId = parseInt(req.params.id);
      const { quantity } = req.body;
      
      if (!quantity || quantity < 1) {
        return res.status(400).json({
          success: false,
          message: 'Quantity harus lebih dari 0'
        });
      }
      
      const cartItem = await prisma.cartItem.findFirst({
        where: {
          id: cartItemId,
          userId
        },
        include: {
          product: true
        }
      });
      
      if (!cartItem) {
        return res.status(404).json({
          success: false,
          message: 'Item tidak ditemukan di keranjang'
        });
      }
      
      if (cartItem.product.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: `Stok tidak cukup. Tersedia: ${cartItem.product.stock}`
        });
      }
      
      const updated = await prisma.cartItem.update({
        where: { id: cartItemId },
        data: { quantity: parseInt(quantity) }
      });
      
      res.json({
        success: true,
        message: 'Keranjang berhasil diupdate',
        data: updated
      });
    } catch (error) {
      console.error('Update cart error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengupdate keranjang'
      });
    }
  },

  removeFromCart: async (req, res) => {
    try {
      const userId = req.user.id;
      const cartItemId = parseInt(req.params.id);
      
      const cartItem = await prisma.cartItem.findFirst({
        where: {
          id: cartItemId,
          userId
        }
      });
      
      if (!cartItem) {
        return res.status(404).json({
          success: false,
          message: 'Item tidak ditemukan di keranjang'
        });
      }
      
      await prisma.cartItem.delete({
        where: { id: cartItemId }
      });
      
      res.json({
        success: true,
        message: 'Item berhasil dihapus dari keranjang'
      });
    } catch (error) {
      console.error('Remove from cart error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat menghapus dari keranjang'
      });
    }
  },

  clearCart: async (req, res) => {
    try {
      const userId = req.user.id;
      
      await prisma.cartItem.deleteMany({
        where: { userId }
      });
      
      res.json({
        success: true,
        message: 'Keranjang berhasil dikosongkan'
      });
    } catch (error) {
      console.error('Clear cart error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengosongkan keranjang'
      });
    }
  }
};

export default CartController;