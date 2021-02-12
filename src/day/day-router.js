const path = require('path');
const express = require('express');
const xss = require('xss');
const DayService = require('./day-service');
const dayRouter = express.Router();
const jsonBodyParser = express.json();

const serializeDay = day => ({
  id: day.id,
  day_title: xss(day.day_title)
});

dayRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    DayService.getAllDays(knexInstance)
      .then(days => {
        res.json(days.map(serializeDay));
      })
      .catch(next);
  })
  .post(jsonBodyParser, (req, res, next) => {
    const knexInstance = req.app.get('db');
    const { day_title } = req.body;
    const newDay = { day_title };

    if (day_title == null || day_title.length < 1) {
      return res.status(400).json({
        error: { message: 'Missing day' }
      });
    }

    DayService.insertDay(knexInstance, newDay)
      .then(day => {
        res.status(201)
          .location(path.posix.join(req.originalUrl, `/${day.id}`))
          .json(serializeDay(day));
      })
      .catch(next);
  });

dayRouter
  .route('/:day_id')
  .all((req, res, next) => {
    DayService.getById(
      req.app.get('db'),
      req.params.day_id
    )
      .then(day => {
        if (!day) {
          return res.status(404).json({
            error: { message: 'Day does not exist' }
          });
        }
        res.day = day;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json(serializeDay(res.day));
  })
  .delete((req, res, next) => {
    const knexInstance = req.app.get('db');
    DayService.deleteDay(knexInstance, req.params.day_id)
      .then(numRowsAffected => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(jsonBodyParser, (req, res, next) => {
    const knexInstance = req.app.get('db');
    const { day_title } = req.body;
    const dayToUpdate = { day_title };
    const numberOfValues = Object.values(dayToUpdate).filter(Boolean).length;

    if (numberOfValues === 0) {
      return res.status(400).json({
        error: {
          message: 'Request body must contain a valid day_title'
        }
      });
    }

    DayService.updateDay(
      knexInstance,
      req.params.day_id,
      dayToUpdate
    )
      .then(numRowsAffected => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = dayRouter;