'use client'

import { Trash2, Loader2 } from 'lucide-react'
import { useFormStatus } from 'react-dom'
import { useActionState, useEffect } from 'react'

interface DeleteCustomerButtonProps {
  customerId: string
  userId: string | null
  deleteAction: (state: any, formData: FormData) => Promise<{ error?: string; success?: boolean }>
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button 
      type="submit" 
      disabled={pending}
      className={`p-1.5 rounded-lg transition-all duration-200 ${
        pending ? 'bg-slate-50 text-slate-400 cursor-not-allowed scale-95' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:scale-110 active:scale-90'
      }`}
      title="Eliminar Cliente"
    >
      {pending ? <Loader2 className="w-4 h-4 animate-spin text-indigo-500" /> : <Trash2 className="w-4 h-4" />}
    </button>
  )
}

export default function DeleteCustomerButton({ customerId, userId, deleteAction }: DeleteCustomerButtonProps) {
  const [state, formAction] = useActionState(deleteAction, null)

  useEffect(() => {
    if (state?.error) {
      alert(state.error)
    }
  }, [state])

  const clientAction = (formData: FormData) => {
    if (confirm('¿Estás seguro de que quieres eliminar este cliente? Se borrarán todos sus datos y reservas.')) {
      formAction(formData)
    }
  }

  return (
    <form action={clientAction} className="inline-flex items-center">
      <input type="hidden" name="id" value={customerId} />
      <input type="hidden" name="user_id" value={userId || ''} />
      <SubmitButton />
    </form>
  )
}
