import express from "express";
import FoodItem from "../models/FoodItem.js";
import User from "../models/User.js";

const router = express.Router();

// @desc    Search for food items or restaurants
// @route   GET /api/public/search
// @access  Public
router.get("/search", async (req, res) => {
  try {
    const { query, type, tags } = req.query;
    let results = [];

    // Base query object
    let dbQuery = {};

    if (type === 'food') {
      // Search Food Items
      if (query) {
        dbQuery.$or = [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { category: { $regex: query, $options: 'i' } }
        ];
      }

      if (tags) {
        const tagList = tags.split(',').map(tag => tag.trim());
        // Find items that have at least one of the matching tags if generic search, 
        // or check if tag matches category/name for broader "Healthy" concept if logic demands.
        // For now, simpler: if tags param exists, filter by those tags in `tags` array or `category`
        dbQuery.$or = [
          ...(dbQuery.$or || []),
          { tags: { $in: tagList.map(t => new RegExp(t, 'i')) } },
          { category: { $in: tagList.map(t => new RegExp(t, 'i')) } }
        ];

        // If we didn't have a query but have tags, we need to ensure $or isn't empty if it was just initialized
        if (!query && dbQuery.$or.length === 0) {
          delete dbQuery.$or; // Cleanup if empty
        }
      }

      // If just tags and no query (common for the home screen buttons)
      if (!query && tags) {
        const tagList = tags.split(',').map(tag => tag.trim());
        dbQuery = {
          $or: [
            { tags: { $in: tagList.map(t => new RegExp(t, 'i')) } },
            { category: { $in: tagList.map(t => new RegExp(t, 'i')) } },
            // Also match name for things like "Salad"
            { name: { $in: tagList.map(t => new RegExp(t, 'i')) } }
          ]
        };
      }

      results = await FoodItem.find(dbQuery).populate('restaurantId', 'name profileImage');

    } else {
      // Search Restaurants (Default)
      if (query) {
        dbQuery = {
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { cuisineType: { $regex: query, $options: 'i' } }
          ],
          role: 'user' // Ensure we only find restaurants/users, not admins if any difference
        };
      }

      results = await User.find(dbQuery).select('-password -email -phone -addresses');
    }

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
