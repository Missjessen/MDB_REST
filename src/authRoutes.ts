import express from 'express'
import { googleLogin, googleCallback } from './controllers/googleAuthController'

const router = express.Router()

router.get('/google', googleLogin)



export default router

