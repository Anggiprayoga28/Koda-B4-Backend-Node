import { prisma } from "../lib/prisma.js";


const ProductModel = {
  create: async (productData) => {
    return await prisma.product.create({
      data: productData
    });
  },

  findById: async (id) => {
    return await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });
  },

  getAll: async (filters = {}) => {
    const where = {};
    
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } }
      ];
    }
    
    if (filters.minPrice || filters.maxPrice) {
      where.price = {};
      if (filters.minPrice) {
        where.price.gte = parseFloat(filters.minPrice);
      }
      if (filters.maxPrice) {
        where.price.lte = parseFloat(filters.maxPrice);
      }
    }
    
    const orderBy = {};
    if (filters.sortBy) {
      orderBy[filters.sortBy] = filters.order === 'desc' ? 'desc' : 'asc';
    } else {
      orderBy.createdAt = 'desc';
    }
    
    return await prisma.product.findMany({
      where,
      orderBy
    });
  },

  update: async (id, productData) => {
    try {
      return await prisma.product.update({
        where: { id: parseInt(id) },
        data: productData
      });
    } catch (error) {
      if (error.code === 'P2025') {
        return null;
      }
      throw error;
    }
  },

  delete: async (id) => {
    try {
      await prisma.product.delete({
        where: { id: parseInt(id) }
      });
      return true;
    } catch (error) {
      if (error.code === 'P2025') {
        return false;
      }
      throw error;
    }
  }
};

export default ProductModel;