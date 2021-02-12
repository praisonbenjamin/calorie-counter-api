const { expect } = require('chai');
const knex = require('knex');
const supertest = require('supertest');
const app = require('../src/app');
const { makeDayArray } = require('./day.fixtures');
const { makeMealArray } = require('./meal.fixtures');

describe('Meal Endpoints', () => {
  let db;

  before('Make the knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL
    });
    app.set('db', db);
  });

  after('disconnect from the database', () => db.destroy());

  before('clean the meal table', () => db('meal').truncate());
  before('clean the day table', () => db.raw('TRUNCATE day_table RESTART IDENTITY CASCADE'));

  afterEach('cleanup meal', () => db('meal').truncate());
  afterEach('cleanup day', () => db.raw('TRUNCATE day_table RESTART IDENTITY CASCADE'));

  describe('GET /api/day', () => {
    context('given no meals in the day', () => {
      it('returns a 200 and an empty array', () => {
        return supertest(app)
          .get('/api/meal')
          .expect(200, []);
      });
    });

    context('given meal in day', () => {
      const testDay = makeDayArray();
      const testMeal = makeMealArray();

      beforeEach('Add days', () => {
        return db.into('day_table')
          .insert(testDay);
      });

      beforeEach('add meal', () => {
        return db.into('meal')
          .insert(testMeal);
      });

      it('returns a 200 and all meal', () => {
        return supertest(app)
          .get('/api/meal')
          .expect(200, testMeal);
      });
    });
  });

  describe('GET api/meal/:meal_id', () => {
    context('when there are no meals in the database', () => {
      it('returns a 404 and an error for the meal', () => {
        const testId = 1612;

        return supertest(app)
          .get(`/api/meal/${testId}`)
          .expect(404)
          .expect({
            error: { message: 'Meal does not exist' }
          });
      });
    });
  });

  describe('POST /api/meal', () => {
    const testDay = makeDayArray();

    beforeEach('Add Day', () => {
      return db.into('day_table')
        .insert(testDay);
    });

    it('returns a 201 when a the test meal has been passed through', () => {
      const newMeal = {
        meal: 'Test meal',
        calories: 270,
        food_item: 'Test food',
        assigned_day: 2,
      };

      return supertest(app)
        .post('/api/meal')
        .send(newMeal)
        .expect(201)
        .expect(res => {
          expect(res.body.meal).to.eql(newMeal.meal);
          expect(res.body.calories).to.eql(newMeal.calories);
          expect(res.body.food_item).to.eql(newMeal.food_item);
          expect(res.body.assigned_day).to.eql(Number(newMeal.assigned_day));
          expect(res.body).to.have.property('id');
        })
        .then(postRes => {
          return supertest(app)
            .get(`/api/meal/${postRes.body.id}`)
            .expect(postRes.body);
        });
    });

    const requiredFields = ['meal', 'calories', 'assigned_day'];
    requiredFields.forEach(field => {
      const newMeal = {
        meal: 'test meal',
        calories: 140,
        food_item: 'test food'
      };

      it(`responds with a 400 and an error message when the '${field}' is missing`, () => {
        delete newMeal[field];

        return supertest(app)
          .post('/api/meal')
          .send(newMeal)
          .expect(400, {
            error: { message: `Missing '${field}' in request body` }
          });
      });
    });
  });

  describe('DELETE /api/meal/:meal_id', () => {
    context('When there are no meals in the database', () => {
      it('returns a 404 and associate error', () => {
        const testId = 1612;
        return supertest(app)
          .delete(`/api/meal/${testId}`)
          .expect(404)
          .expect({
            error: { message: 'Meal does not exist' }
          });
      });
    });

    context('When there are Days and meals in the database', () => {
      const testDays = makeDayArray();

      beforeEach('add days to the database', () => {
        return db.into('day_table')
          .insert(testDays);
      });

      beforeEach('add meals to database', () => {
        const testMeal = makeMealArray();
        return db.into('meal')
          .insert(testMeal);
      });

      it('returns a 204 and the meal is not in a get request', () => {
        const testMeal = makeMealArray();
        const idToRemove = 2;
        const expectedArray = testMeal.filter(meal => meal.id != idToRemove);

        return supertest(app)
          .delete(`/api/meal/${idToRemove}`)
          .expect(204)
          .then(res =>
            supertest(app)
              .get('/api/meal')
              .expect(200, expectedArray)
          );
      });
    });
  });
});