import express from 'express'
import getAction from '../services/getAction.service.js';
import * as controller from '../controllers/enemy.controller.js'

export const enemyRouter = express.Router()

enemyRouter.get('/', controller.get)