import { prisma } from '../lib/prisma.js';

const HistoryController = {
  getHistory: async (req, res) => {
    try {
      const userId = req.user.id;
      const { 
        page = 1, 
        limit = 4, 
        status,
        startDate,
        endDate,
        month 
      } = req.query;
      
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);
      
      const where = { userId };
      
      if (status) {
        where.status = status;
      }
      
      if (startDate || endDate || month) {
        where.orderDate = {};
        
        if (month) {
          const [monthName, year] = month.split(' ');
          const monthIndex = new Date(Date.parse(monthName + " 1, 2000")).getMonth();
          const firstDay = new Date(parseInt(year), monthIndex, 1);
          const lastDay = new Date(parseInt(year), monthIndex + 1, 0, 23, 59, 59);
          
          where.orderDate.gte = firstDay;
          where.orderDate.lte = lastDay;
        } else {
          if (startDate) {
            where.orderDate.gte = new Date(startDate);
          }
          if (endDate) {
            where.orderDate.lte = new Date(endDate + 'T23:59:59');
          }
        }
      }
      
      const total = await prisma.order.count({ where });
      
      const orders = await prisma.order.findMany({
        where,
        skip,
        take,
        orderBy: { orderDate: 'desc' },
        include: {
          orderItems: {
            include: {
              product: {
                select: {
                  image: true,
                  name: true
                }
              }
            },
            take: 1
          }
        }
      });
      
      const formattedOrders = orders.map(order => ({
        id: order.id,
        invoice: order.orderNumber,
        date: order.orderDate.toLocaleDateString('id-ID', { 
          day: '2-digit', 
          month: 'long', 
          year: 'numeric' 
        }),
        status: order.status,
        statusDisplay: getStatusDisplay(order.status),
        total: order.total,
        imageProduct: order.orderItems[0]?.product?.image || null
      }));
      
      res.json({
        success: true,
        message: 'Order history retrieved',
        data: formattedOrders,
        meta: {
          page: parseInt(page),
          limit: parseInt(limit),
          totalItems: total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Get history error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil riwayat pesanan'
      });
    }
  }
};

function getStatusDisplay(status) {
  const statusMap = {
    'pending': 'Menunggu',
    'processing': 'Diproses',
    'shipping': 'Dikirim',
    'delivered': 'Terkirim',
    'done': 'Selesai',
    'cancelled': 'Dibatalkan'
  };
  
  return statusMap[status] || status;
}

export default HistoryController;