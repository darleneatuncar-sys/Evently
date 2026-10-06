import type { Request, Response } from 'express'
import * as registrationService from '../services/registration.service'
import { validateRegistrationInput } from '../validators/registration.validator'

type IdParams = { id: string }

export async function registerToEvent(req: Request<IdParams>, res: Response) {
  const input = validateRegistrationInput(req.body)
  const result = await registrationService.registerToEvent(req.user!.id, req.params.id, input)

  res.status(201).json({
    success: true,
    data: result,
    message: result.emailSent
      ? 'Registro confirmado'
      : 'Tu registro fue confirmado, pero no pudimos enviar el correo. Puedes consultar tu entrada desde Mis entradas.',
  })
}

export async function cancelRegistration(req: Request<IdParams>, res: Response) {
  await registrationService.cancelRegistration(req.user!.id, req.params.id)
  res.json({ success: true, message: 'Registro cancelado correctamente' })
}
