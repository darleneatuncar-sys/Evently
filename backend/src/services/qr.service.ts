import QRCode from 'qrcode'

const QR_OPTIONS = {
  width: 320,
  margin: 1,
  errorCorrectionLevel: 'M' as const,
}

export function generateTicketQr(ticketCode: string): Promise<string> {
  return QRCode.toDataURL(ticketCode, QR_OPTIONS)
}

export function generateTicketQrBuffer(ticketCode: string): Promise<Buffer> {
  return QRCode.toBuffer(ticketCode, QR_OPTIONS)
}
