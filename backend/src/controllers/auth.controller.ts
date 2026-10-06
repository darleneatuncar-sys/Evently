import type { Request, Response } from 'express'
import * as authService from '../services/auth.service'
import { validateLogin, validateRegister } from '../validators/auth.validator'

export async function register(req: Request, res: Response) {
  const input = validateRegister(req.body)
  const user = await authService.registerUser(input)
  res.status(201).json({
    success: true,
    data: user,
    message: 'Usuario registrado correctamente',
  })
}

export async function login(req: Request, res: Response) {
  const input = validateLogin(req.body)
  const result = await authService.loginUser(input)
  res.json({ success: true, data: result })
}

export async function me(req: Request, res: Response) {
  const user = await authService.getUserById(req.user!.id)
  res.json({ success: true, data: user })
}
