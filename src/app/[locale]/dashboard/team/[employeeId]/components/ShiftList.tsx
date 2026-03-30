'use client'

import { useState, useTransition } from 'react'
import { Calendar, Trash2, Loader2, Plus } from 'lucide-react'
import { deleteShiftAction } from '@/lib/team/actions'
import { useTranslations } from 'next-intl'
import ShiftFormModal from '@/app/[locale]/dashboard/team/[employeeId]/components/ShiftFormModal'

export default function ShiftList({ 
  employeeId, 
  shifts, 
  locale 
}: { 
  employeeId: string, 
  shifts: any[], 
  locale: string 
}) {
  const [isPending, startTransition] = useTransition()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const t = useTranslations('Team.shiftsTab')

  const handleDelete = (shiftId: string) => {
    if (!confirm(t('deleteConfirm'))) return
    startTransition(async () => {
      try {
        await deleteShiftAction(shiftId, employeeId, locale)
      } catch (error: any) {
        alert(error.message)
      }
    })
  }

  const formatDateTime = (iso: string) => {
    return new Date(iso).toLocaleString(locale, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-100 flex items-center gap-2 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          {t('newShift')}
        </button>
      </div>

      {!shifts || shifts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
          <Calendar className="w-12 h-12 text-slate-200 mb-3" />
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{t('noShifts')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {shifts.map((shift) => (
            <div key={shift.id} className="p-6 rounded-2xl border border-slate-100 bg-white group hover:border-indigo-100 hover:shadow-md hover:shadow-indigo-50/50 transition-all relative">
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  shift.type === 'work' ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500/10' : 
                  shift.type === 'break' ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-500/10' : 
                  'bg-slate-100 text-slate-700'
                }`}>
                  {t(shift.type)}
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{t('start')}</span>
                  <span className="text-sm font-bold text-slate-900">{formatDateTime(shift.start_at)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{t('end')}</span>
                  <span className="text-sm font-medium text-slate-500">{formatDateTime(shift.end_at)}</span>
                </div>
              </div>

              {shift.notes && (
                <div className="mt-4 pt-4 border-t border-slate-50">
                  <p className="text-xs text-slate-400 italic line-clamp-2 leading-relaxed">"{shift.notes}"</p>
                </div>
              )}

              <button 
                onClick={() => handleDelete(shift.id)}
                disabled={isPending}
                className="absolute top-5 right-5 p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 disabled:opacity-30 active:scale-95"
              >
                {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <ShiftFormModal 
            employeeId={employeeId}
            onClose={() => setIsModalOpen(false)}
            locale={locale}
        />
      )}
    </div>
  )
}
