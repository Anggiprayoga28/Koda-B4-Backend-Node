import { prisma } from '../lib/prisma.js';

const TransactionController = {
  checkout: async (req, res) => {
    try {
      const userId = req.user.id;
      const data = (req.body && Object.keys(req.body).length > 0) ? req.body : req.query;
      const { email, fullName, address, deliveryMethod = 'dine_in', paymentMethodId = 1 } = data;
      
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
        
        let orderEmail = email;
        let orderFullName = fullName;
        let orderAddress = address;
        
        if (!orderEmail || !orderFullName || !orderAddress) {
          const user = await tx.user.findUnique({
            where: { id: userId },
            include: {
              profile: true
            }
          });
          
          if (!orderEmail) orderEmail = user.email;
          if (!orderFullName) orderFullName = user.profile?.fullName || user.email;
          if (!orderAddress) orderAddress = user.profile?.address || 'Default Address';
        }
        
        if (!orderEmail || !orderFullName || !orderAddress) {
          throw new Error('Email, nama lengkap, dan alamat harus diisi');
        }
        
        const pendingStatus = await tx.orderStatus.findFirst({
          where: { name: 'pending' }
        });
        
        if (!pendingStatus) {
          throw new Error('Status pending tidak ditemukan');
        }
        
        let deliveryMethodRecord;
        const deliveryMethodInt = parseInt(deliveryMethod);
        
        if (!isNaN(deliveryMethodInt)) {
          deliveryMethodRecord = await tx.deliveryMethod.findUnique({
            where: { id: deliveryMethodInt }
          });
        } else {
          deliveryMethodRecord = await tx.deliveryMethod.findFirst({
            where: { name: deliveryMethod }
          });
        }
        
        if (!deliveryMethodRecord) {
          throw new Error('Delivery method tidak ditemukan');
        }
        
        deliveryFee = deliveryMethodRecord.baseFee;
        
        const total = subtotal + deliveryFee;
        
        const paymentMethodRecord = await tx.paymentMethod.findUnique({
          where: { id: parseInt(paymentMethodId) }
        });
        
        if (!paymentMethodRecord) {
          throw new Error('Payment method tidak ditemukan');
        }
        
        const orderNumber = `ORD-${Date.now()}`;
        
        const order = await tx.order.create({
          data: {
            orderNumber,
            userId,
            statusId: pendingStatus.id,
            deliveryAddress: orderAddress,
            deliveryMethodId: deliveryMethodRecord.id,
            subtotal,
            deliveryFee,
            taxAmount: 0,
            total,
            paymentMethodId: paymentMethodRecord.id,
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