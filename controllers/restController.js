const { Restaurant, Category, User, Comment } = require('../models')
const pageLimit = 10

const restController = {
  getRestaurants: async (req, res, next) => {
    let offset = 0
    const whereQuery = {}
    if (req.query.page) offset = (req.query.page - 1) * pageLimit
    if (req.query.categoryId) whereQuery.CategoryId = Number(req.query.categoryId)

    try {
      const [result, categories] = await Promise.all([
        Restaurant.findAndCountAll({
          include: Category,
          where: whereQuery,
          offset,
          limit: pageLimit,
          raw: true,
          nest: true
        }),
        Category.findAll({ raw: true, nest: true })
      ])

      // data for pagination
      const page = Number(req.query.page) || 1
      const pages = Math.ceil(result.count / pageLimit)
      const totalPage = Array.from({ length: pages }).map((item, index) => index + 1)
      const prev = page - 1 < 1 ? 1 : page - 1
      const next = page + 1 > pages ? pages : page + 1

      const data = result.rows.map(r => ({
        ...r,
        description: r.description.substring(0, 50),
        categoryName: r.Category.name
      }))

      return res.render('restaurants', {
        restaurants: data,
        categories,
        categoryId: whereQuery.CategoryId,
        pages: pages <= 1 ? 'invisible' : '', // <= 一頁不顯示 pagination
        page,
        totalPage,
        prev,
        next
      })
    } catch (error) {
      next(error)
    }
  },

  getRestaurant: async (req, res, next) => {
    try {
      const restaurant = await Restaurant.findByPk(req.params.id, {
        include: [Category, { model: Comment, include: User }]
      })
      if (!restaurant) throw new Error('restaurant not found.')

      restaurant.increment('viewCounts', { by: 1 })
      console.log(restaurant)

      res.render('restaurant', { restaurant: restaurant.toJSON() })
    } catch (error) {
      next(error)
    }
  },

  getFeeds: async (req, res, next) => {
    try {
      const [restaurants, comments] = await Promise.all([
        Restaurant.findAll({
          limit: 10,
          raw: true,
          nest: true,
          order: [['createdAt', 'DESC']],
          include: Category
        }),
        Comment.findAll({
          limit: 10,
          raw: true,
          nest: true,
          order: [['createdAt', 'DESC']],
          include: [User, Restaurant]
        })
      ])

      res.render('feeds', { restaurants, comments })
    } catch (error) {
      next(error)
    }
  },

  getDashboard: async (req, res, next) => {
    try {
      const restaurant = await Restaurant.findByPk(req.params.id, {
        include: [Category, Comment]
      })
      if (!restaurant) throw new Error('restaurant not found.')

      console.log(restaurant.toJSON())
      res.render('dashboard', { restaurant: restaurant.toJSON() })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = restController
