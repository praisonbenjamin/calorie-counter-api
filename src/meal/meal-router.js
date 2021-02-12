const path = require('path');
const express = require('express');
const xss = require('xss');
const MealService = require('./meal-service');
const mealRouter = express.Router();
const jsonBodyParser = express.json();

const serializeMeal = meal => ({
  id: meal.id,
  meal: xss(meal.meal),
  calories: meal.calories,
  food_item: xss(meal.food_item),
  assigned_day: meal.assigned_day,
});

mealRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    MealService.getAllMeals(knexInstance)
      .then(meals => {
        res.json(meals.map(serializeMeal));
      })
      .catch(next);
  })
  .post(jsonBodyParser, (req, res, next) => {
    const knexInstance = req.app.get('db');
    const { meal, calories, food_item, assigned_day } = req.body;
    const newMeal = { meal, calories, food_item, assigned_day };

    for (const [key, value] of Object.entries(newMeal))
      if (value == null)
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        });

    newMeal.assigned_day = Number(assigned_day);

    if (food_item) {
      newMeal.food_item = food_item;
    }

    MealService.insertMeal(knexInstance, newMeal)
      .then(meal => {
        res.status(201)
          .location(path.posix.join(req.originalUrl, `/${meal.id}`))
          .json(serializeMeal(meal));
      })
      .catch(next);
  });

mealRouter
  .route('/:meal_id')
  .all((req, res, next) => {
    MealService.getById(
      req.app.get('db'),
      req.params.meal_id
    )
      .then(meal => {
        if (!meal) {
          return res.status(404).json({
            error: { message: 'Meal does not exist' }
          });
        }
        res.meal = meal;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json(serializeMeal(res.meal));
  })
  .delete((req, res, next) => {
    MealService.deleteMeal(req.app.get('db'), req.params.meal_id)
      .then((numRowsAffected) => {
        return res.status(204).end();
      })
      .catch(next);
  })
  .patch(jsonBodyParser, (req, res, next) => {
    const { meal, calories, food_item, assigned_day } = req.body;
    const newMealFields = { meal, calories, food_item, assigned_day };

    const numOfValues = Object.values(newMealFields).filter(Boolean).length;
    if (numOfValues === 0) {
      return res
        .status(400)
        .json({
          error: {
            message:
                            'Your response must include one of the following fields: meal, calories',
          },
        });
    }

    MealService.updateMeal(
      req.app.get('db'),
      req.params.meal_id,
      newMealFields
    )
      .then((numRowsAffected) => {
        return res.status(204).end();
      })
      .catch(next);
  });


module.exports = mealRouter;