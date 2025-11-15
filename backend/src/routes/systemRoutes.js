import express from 'express'
import { getSystemInfo, clearCache, getLogs } from '../controllers/systemController.js'

const router = express.Router()

router.get('/info', getSystemInfo)
router.post('/cache/clear', clearCache)
router.get('/logs', getLogs)

export default router

