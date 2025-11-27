import { prisma } from '../lib/prisma.js';

const TransactionController = {
  checkout: async (req, res) => {
    try {
      const userId = req.user.id;
      const { email, fullName, address, deliveryMethod = 'dine_in', paymentMethodId = 1 } = req.body;
      
      const result = await prisma.$transaction(async (tx) => {
        const cartItems = await tx.cartItem.findMany({
          where: { userId },
          include: {
            product: true,
            size: true,
            temperature: true
          }
        });
        
        if (cartItems.length === 0) {
          throw new Error('Keranjang kosong');
        }
        
        let subtotal = 0;
        for (const item of cartItems) {
          if (item.product.stock < item.quantity) {
            throw new Error(`Stok tidak cukup untuk ${item.product.name}. Tersedia: ${item.product.stock}`);
          }
          
          let itemPrice = item.product.price;
          if (item.size) itemPrice += item.size.priceAdjustment || 0;
          if (item.temperature) itemPrice += item.temperature.price || 0;
          
          subtotal += itemPrice * item.quantity;
        }
        
        let deliveryFee = 0;
        if (deliveryMethod === 'door_delivery') {
          deliveryFee = 10000;
        }
        
        const total = subtotal + deliveryFee;
        
        let orderEmail = email;
        let orderFullName = fullName;
        let orderAddress = address;
        
        if (!orderEmail || !orderFullName || !orderAddress) {
          const user = await tx.user.findUnique({
            where: { id: userId },
            include: {
              userProfile: true
            }
          });
          
          if (!orderEmail) orderEmail = user.email;
          if (!orderFullName) orderFullName = user.userProfile?.fullName || user.email;
          if (!orderAddress) orderAddress = user.userProfile?.address || 'Default Address';
        }
        
        if (!orderEmail || !orderFullName || !orderAddress) {
          throw new Error('Email, nama lengkap, dan alamat harus diisi');
        }
        
        const validMethods = ['dine_in', 'door_delivery', 'pick_up'];
        if (!validMethods.includes(deliveryMethod)) {
          throw new Error('Metode pengiriman tidak valid');
        }
        
        const orderNumber = `ORD-${Date.now()}`;
        
        const order = await tx.order.create({
          data: {
            orderNumber,
            userId,
            status: 'pending',
            deliveryAddress: orderAddress,
            deliveryMethod,
            subtotal,
            deliveryFee,
            taxAmount: 0,
            total,
            paymentMethod: paymentMethodId.toString(),
            orderDate: new Date()
          }
        });
        
        for (const item of cartItems) {
          let itemPrice = item.product.price;
          if (item.size) itemPrice += item.size.priceAdjustment || 0;
          if (item.temperature) itemPrice += item.temperature.price || 0;
          
          await tx.orderItem.create({
            data: {
              orderId: order.id,
              productId: item.productId,
              quantity: item.quantity,
              sizeId: item.sizeId,
              temperatureId: item.temperatureId,
              unitPrice: itemPrice,
              isFlashSale: item.product.isFlashSale || false
            }
          });
          
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity
              }
            }
          });
        }
        
        await tx.cartItem.deleteMany({
          where: { userId }
        });
        
        return {
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          subtotal: order.subtotal,
          deliveryFee: order.deliveryFee,
          total: order.total,
          email: orderEmail,
          fullName: orderFullName,
          address: orderAddress,
          deliveryMethod: order.deliveryMethod
        };
      });
      
      res.status(201).json({
        success: true,
        message: 'Pesanan berhasil dibuat',
        data: result
      });
    } catch (error) {
      console.error('Checkout error:', error);
      
      if (error.message.includes('Keranjang kosong') || 
          error.message.includes('Stok tidak cukup') ||
          error.message.includes('harus diisi') ||
          error.message.includes('tidak valid')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat membuat pesanan'
      });
    }
  }
};

export default TransactionController;