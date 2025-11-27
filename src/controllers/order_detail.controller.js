import { prisma } from '../lib/prisma.js';

const OrderDetailController = {
  getOrderDetail: async (req, res) => {
    try {
      const userId = req.user.id;
      const orderId = parseInt(req.params.id);
      
      if (!orderId || orderId < 1) {
        return res.status(400).json({
          success: false,
          message: 'Invalid order ID'
        });
      }
      
      const order = await prisma.order.findFirst({
        where: {
          id: orderId,
          userId
        },
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
              },
              size: {
                select: {
                  name: true
                }
              },
              temperature: {
                select: {
                  name: true
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
      
      const orderDate = order.orderDate.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }) + ' at ' + order.orderDate.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      
      const items = order.orderItems.map(item => ({
        productId: item.productId,
        name: item.product.name,
        quantity: item.quantity,
        size: item.size?.name || '',
        temperature: item.temperature?.name || '',
        unitPrice: item.unitPrice,
        totalPrice: item.unitPrice * item.quantity,
        imageUrl: item.product.image ? `${req.protocol}://${req.get('host')}${item.product.image}` : null,
        isFlashSale: item.isFlashSale || false,
        deliveryMethod: order.deliveryMethod || 'Dine In'
      }));
      
      const response = {
        orderNumber: order.orderNumber,
        orderDate,
        fullName: order.user.userProfile?.fullName || order.user.email,
        phone: order.user.userProfile?.phone || '',
        address: order.deliveryAddress,
        deliveryMethod: order.deliveryMethod || 'Dine In',
        paymentMethod: order.paymentMethod || 'Cash',
        status: order.status,
        statusDisplay: getStatusDisplay(order.status),
        subtotal: order.subtotal,
        deliveryFee: order.deliveryFee,
        taxAmount: order.taxAmount || 0,
        total: order.total,
        items
      };
      
      res.json({
        success: true,
        message: 'Order detail retrieved successfully',
        data: response
      });
    } catch (error) {
      console.error('Get order detail error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil detail pesanan'
      });
    }
  }
};

function getStatusDisplay(status) {
  const statusMap = {
    'pending': 'Menunggu Pembayaran',
    'processing': 'Sedang Diproses',
    'shipping': 'Sedang Dikirim',
    'delivered': 'Sudah Terkirim',
    'done': 'Selesai',
    'cancelled': 'Dibatalkan'
  };
  
  return statusMap[status] || status;
}

export default OrderDetailController;