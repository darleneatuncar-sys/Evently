import { prisma } from '../config/prisma'

export function listCategories() {
  return prisma.category.findMany({ orderBy: { name: 'asc' } })
}
