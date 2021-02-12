const { expect } = require('chai');
const knex = require('knex');
const supertest = require('supertest');
const app = require('../src/app');
const { makeDayArray, makeMaliciousImgDay } = require('./day.fixtures');

describe('Day Endpoints', () => {
    let db;

    before('Make the knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL
        });
        app.set('db', db);
    });

    after('disconnect from the database', () => db.destroy());

    before('clean the table', () => db.raw('TRUNCATE day_table RESTART IDENTITY CASCADE'));

    afterEach('cleanup', () => db.raw('TRUNCATE day_table RESTART IDENTITY CASCADE'));

    describe('/GET /api/day', () => {
        context('given no day in the database', () => {
            it('returns a 200 and an empty list', () => {
                return supertest(app)
                    .get('/api/day')
                    .expect(200, []);
            });
        });

        context('given day in the database', () => {
            const testDay = makeDayArray();

            beforeEach('insert day', () => {
                return db.into('day_table')
                    .insert(testDay);
            });

            it('returns with a 200 and the array of day', () => {
                return supertest(app)
                    .get('/api/day')
                    .expect(200, testDay);
            });
        });
    });

    describe('GET /api/day/:day_id', () => {
        context('given no day in the database', () => {
            it('retuns a 404 and an error for the day', () => {
                const testId = 1612;

                return supertest(app)
                    .get(`/api/day/${testId}`)
                    .expect(404)
                    .expect({
                        error: { message: 'Day does not exist' }
                    });
            });
        });

        context('given day in the database', () => {
            const testDay = makeDayArray();

            beforeEach('insert day', () => {
                return db.into('day_table')
                    .insert(testDay);
            });

            it('returns a 200 and the expected day', () => {
                const testId = 2;
                const expectedDay = testDay[testId - 1];

                return supertest(app)
                    .get(`/api/day/${testId}`)
                    .expect(200, expectedDay);
            });
        });
    });

    describe('POST /api/day', () => {
        it('creates a day responding with a 201 then the new day', () => {
            const newDay = { day_title: 'New Day' };

            return supertest(app)
                .post('/api/day')
                .send(newDay)
                .expect(201)
                .expect(res => {
                    expect(res.body.day_title).to.eql(newDay.day_title);
                    expect(res.body).to.have.property('id');
                })
                .then(postRes => {
                    return supertest(app)
                        .get(`/api/day/${postRes.body.id}`)
                        .expect(postRes.body);
                });
        });

        it('rejectes a day with no title, sending a 400 and error', () => {
            const emptyDay = { day_title: '' };

            return supertest(app)
                .post('/api/day')
                .send(emptyDay)
                .expect(400)
                .expect({
                    error: { message: `Missing day` }
                });
        });

        it('Sanitizes an xss attack', () => {
            const { maliciousImgDay, expectedImgDay } = makeMaliciousImgDay();

            return supertest(app)
                .post('/api/day')
                .send(maliciousImgDay)
                .expect(201)
                .expect(res => {
                    expect(res.body.day_title).to.eql(expectedImgDay.day_title);
                });
        });
    });

    describe('DELETE /api/day/:day_id', () => {
        context('given no day in the database', () => {
            it('retuns a 404 and an error for the day', () => {
                const testId = 1612;

                return supertest(app)
                    .delete(`/api/day/${testId}`)
                    .expect(404)
                    .expect({
                        error: { message: 'Day does not exist' }
                    });
            });
        });

        context('given day in the database', () => {
            const testDay = makeDayArray();

            beforeEach('Add day to the database', () => {
                return db.into('day_table')
                    .insert(testDay);
            });

            it('deletes the day and returns a 204', () => {
                const testId = 2;
                const expectedDay = testDay.filter(day => day.id != testId);

                return supertest(app)
                    .delete(`/api/day/${testId}`)
                    .expect(204)
                    .then(res =>
                        supertest(app)
                            .get('/api/day')
                            .expect(expectedDay)
                    );
            });
        });
    });

    describe('PATCH api/day/:day_id', () => {
        context('when there are no items in the database', () => {
            it('retuns a 404 and an error for the day', () => {
                const testId = 1612;

                return supertest(app)
                    .patch(`/api/day/${testId}`)
                    .expect(404)
                    .expect({
                        error: { message: 'Day does not exist' }
                    });
            });
        });

        context('When items are in the database', () => {
            const testDay = makeDayArray();
            beforeEach('Add day to database', () => {
                return db.into('day_table')
                    .insert(testDay);
            });

            it('updates the day name with a 204', () => {
                const idToUpdate = 2;
                const updateDay = {
                    day_title: 'New Day Name'
                };
                const expectedDay = {
                    ...testDay[idToUpdate - 1],
                    ...updateDay
                };

                return supertest(app)
                    .patch(`/api/day/${idToUpdate}`)
                    .send(updateDay)
                    .expect(204)
                    .then(res =>
                        supertest(app)
                            .get(`/api/day/${idToUpdate}`)
                            .expect(expectedDay)
                    )
            });

            it('returns a 400 and error when there is nothing to update', () => {
                const idToUpdate = 2;
                const updateDay = {
                    day_title: ''
                };
                const expectedDay = {
                    ...testDay[idToUpdate - 1],
                    ...updateDay
                };

                return supertest(app)
                    .patch(`/api/day/${idToUpdate}`)
                    .send(updateDay)
                    .expect(400)
                    .expect({
                        error: {
                            message: 'Request body must contain a valid day_title'
                        }
                    });
            });
        });
    });
});