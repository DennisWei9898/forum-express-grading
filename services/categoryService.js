const { Category } = require('../models')

const categoryController = {
  getCategories: async (req, res, next, callback) => {
    try {
      const categories = await Category.findAll({ raw: true, nest: true })

      if (req.params.id) {
        const category = await Category.findByPk(req.params.id)
        if (!category) throw new Error('category not found.')

        callback({ categories, category: category.toJSON() })
      } else {
        callback({ categories })
      }
    } catch (error) {
      next(error)
    }
  }
}

module.exports = categoryController
