import express from 'express'
import { getAnalytics, getTransactionsByStatus } from '../controllers/analyticsController.js'

const router = express.Router()

router.get('/', getAnalytics)
router.get('/status/:status', getTransactionsByStatus)

export default router

