function makeMealArray() {
  return [
    {
      id: 1,
      meal: 'Breakfast',
      calories: 170,
      food_item: 'test food item 1',
      assigned_day: 1
    },
    {
      id: 2,
      meal: 'Lunch',
      calories: 170,
      food_item: 'test food item 1',
      assigned_day: 2
    },
    {
      id: 3,
      meal: 'Dinner',
      calories: 170,
      food_item: 'test food item 1',
      assigned_day: 2
    },
    {
      id: 4,
      meal: 'Dinner',
      calories: 170,
      food_item: 'test food item 1',
      assigned_day: 3
    }
  ];
}

module.exports = {
  makeMealArray
};