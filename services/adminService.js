const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category

const adminService = {
  getRestaurants: async (req, res, next, callback) => {
    try {
      const restaurants = await Restaurant.findAll({
        raw: true,
        nest: true,
        include: Category
      })
      callback({ restaurants })
    } catch (error) {
      next(error)
    }
  },

  getRestaurant: async (req, res, next, callback) => {
    try {
      const restaurant = await Restaurant.findByPk(req.params.id, { include: Category })
      if (!restaurant) throw new Error('restaurant not found.')

      callback({ restaurant: restaurant.toJSON() })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = adminService
