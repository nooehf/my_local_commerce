'use client'

import { Trash2 } from 'lucide-react'
import { useState } from 'react'

interface DeleteCustomerButtonProps {
  customerId: string
  userId: string | null
  deleteAction: (formData: FormData) => Promise<void>
}

export default function DeleteCustomerButton({ customerId, userId, deleteAction }: DeleteCustomerButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este cliente? Se borrarán todos sus datos y reservas.')) {
      e.preventDefault()
      return
    }
    setIsDeleting(true)
  }

  return (
    <form action={deleteAction} onSubmit={handleSubmit}>
      <input type="hidden" name="id" value={customerId} />
      <input type="hidden" name="user_id" value={userId || ''} />
      <button 
        type="submit" 
        disabled={isDeleting}
        className={`p-1.5 rounded-lg transition-colors ${
          isDeleting ? 'text-slate-300' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
        }`}
        title="Eliminar Cliente"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </form>
  )
}
