'use client'

import { useState } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { deleteEmployeeAction } from '@/app/[locale]/dashboard/employees/actions'
import { useRouter } from 'next/navigation'

export default function DeleteEmployeeButton({ 
  employeeId, 
  employeeName,
  locale 
}: { 
  employeeId: string, 
  employeeName: string,
  locale: string
}) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm(`¿Estás seguro de que quieres eliminar a ${employeeName}? Esta acción es permanente e incluye su cuenta de acceso.`)) {
      return
    }

    setIsDeleting(true)
    try {
      await deleteEmployeeAction(employeeId, locale)
      router.refresh()
    } catch (error: any) {
      alert(error.message || 'Error al eliminar empleado')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all disabled:opacity-50"
      title="Eliminar empleado definitivamente"
    >
      {isDeleting ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Trash2 className="w-4 h-4" />
      )}
    </button>
  )
}
