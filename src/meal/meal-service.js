const MealService = {
  getAllMeals(knex) {
    return knex.select('*').from('meal');
  },
  insertMeal(knex, newMeal) {
    return knex
      .insert(newMeal)
      .into('meal')
      .returning('*')
      .then(rows => {
        return rows[0];
      });
  },
  getById(knex, id) {
    return knex
      .from('meal')
      .select('*')
      .where('id', id)
      .first();
  },
  deleteMeal(knex, id) {
    return knex
      .from('meal')
      .where({ id })
      .delete();
  },
  updateMeal(knex, id, newMealFields) {
    return knex
      .from('meal')
      .where({ id })
      .update(newMealFields);
  }
};
  
module.exports = MealService;