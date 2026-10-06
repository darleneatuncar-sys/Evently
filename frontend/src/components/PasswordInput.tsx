import { useState, type InputHTMLAttributes } from 'react'
import { IconEye, IconEyeOff } from './icons'

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'className'>

function PasswordInput({ ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="auth-input-wrap">
      <input {...props} className="auth-input" type={visible ? 'text' : 'password'} />
      <button
        type="button"
        className="auth-eye-toggle"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        aria-pressed={visible}
      >
        {visible ? <IconEyeOff className="h-5 w-5" /> : <IconEye className="h-5 w-5" />}
      </button>
    </div>
  )
}

export default PasswordInput
