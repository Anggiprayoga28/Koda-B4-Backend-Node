import { prisma } from '../lib/prisma.js';

const OrderController = {
  getAllOrders: async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);
      
      const total = await prisma.order.count();
      
      const orders = await prisma.order.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              email: true
            }
          }
        }
      });
      
      const totalPages = Math.ceil(total / take);
      
      res.json({
        success: true,
        message: 'Orders retrieved successfully',
        data: orders,
        meta: {
          page: parseInt(page),
          limit: take,
          totalItems: total,
          totalPages
        },
        links: generatePaginationLinks(req, parseInt(page), totalPages, take)
      });
    } catch (error) {
      console.error('Get all orders error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil data pesanan'
      });
    }
  },

  getOrderById: async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (id <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid order ID'
        });
      }
      
      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              email: true,
              userProfile: {
                select: {
                  fullName: true,
                  phone: true
                }
              }
            }
          },
          orderItems: {
            include: {
              product: {
                select: {
                  name: true,
                  image: true
                }
              }
            }
          }
        }
      });
      
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Pesanan tidak ditemukan'
        });
      }
      
      res.json({
        success: true,
        message: 'Order retrieved successfully',
        data: order
      });
    } catch (error) {
      console.error('Get order by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil data pesanan'
      });
    }
  },

  createOrder: async (req, res) => {
    try {
      const userId = req.user.id;
      const { productId, quantity } = req.body;
      
      if (!productId || !quantity) {
        return res.status(400).json({
          success: false,
          message: 'Product ID dan quantity harus diisi'
        });
      }
      
      const productIdInt = parseInt(productId);
      const quantityInt = parseInt(quantity);
      
      if (productIdInt <= 0 || quantityInt <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Product ID dan quantity harus valid'
        });
      }
      
      if (quantityInt > 100) {
        return res.status(400).json({
          success: false,
          message: 'Quantity maksimal 100'
        });
      }
      
      const product = await prisma.product.findUnique({
        where: { id: productIdInt }
      });
      
      if (!product) {
        return res.status(400).json({
          success: false,
          message: 'Produk tidak ditemukan'
        });
      }
      
      if (!product.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Produk tidak tersedia'
        });
      }
      
      if (product.stock < quantityInt) {
        return res.status(400).json({
          success: false,
          message: 'Stok tidak cukup'
        });
      }
      
      const total = product.price * quantityInt;
      const orderNumber = `ORD-${Date.now()}`;
      
      const order = await prisma.order.create({
        data: {
          orderNumber,
          userId,
          status: 'pending',
          deliveryAddress: 'Default',
          deliveryMethod: 'dine_in',
          subtotal: total,
          deliveryFee: 0,
          taxAmount: 0,
          total,
          paymentMethod: '1',
          orderDate: new Date()
        }
      });
      
      res.status(201).json({
        success: true,
        message: 'Pesanan berhasil dibuat',
        data: {
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          total: order.total
        }
      });
    } catch (error) {
      console.error('Create order error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat membuat pesanan'
      });
    }
  },

  updateOrderStatus: async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (id <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid order ID'
        });
      }
      
      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status harus diisi'
        });
      }
      
      const validStatuses = ['pending', 'processing', 'shipping', 'delivered', 'done', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Status tidak valid. Harus salah satu dari: ${validStatuses.join(', ')}`
        });
      }
      
      const order = await prisma.order.findUnique({
        where: { id }
      });
      
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Pesanan tidak ditemukan'
        });
      }
      
      const updatedOrder = await prisma.order.update({
        where: { id },
        data: { status }
      });
      
      res.json({
        success: true,
        message: 'Status pesanan berhasil diupdate',
        data: updatedOrder
      });
    } catch (error) {
      console.error('Update order status error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengupdate status pesanan'
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

export default OrderController;