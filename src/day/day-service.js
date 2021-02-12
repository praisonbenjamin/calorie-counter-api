const DayService = {
  getAllDays(knex) {
    return knex.select('*').from('day_table');
  },
  insertDay(knex, newDay) {
    return knex
      .insert(newDay)
      .into('day_table')
      .returning('*')
      .then(rows => {
        return rows[0];
      });
  },
  getById(knex, id) {
    return knex
      .from('day_table')
      .select('*')
      .where('id', id)
      .first();
  },
  deleteDay(knex, id) {
    return knex
      .from('day_table')
      .where({ id })
      .delete();
  },
  updateDay(knex, id, newDayFields) {
    return knex
      .from('day_table')
      .where({ id })
      .update(newDayFields);
  }
};
  
module.exports = DayService;