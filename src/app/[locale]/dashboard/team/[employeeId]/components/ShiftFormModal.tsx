'use client'

import { useState, useTransition, useEffect } from 'react'
import { X, Loader2, Save, Calendar, Clock, AlertCircle } from 'lucide-react'
import { createShiftAction } from '@/lib/team/actions'
import { useTranslations } from 'next-intl'

export default function ShiftFormModal({
  employeeId,
  onClose,
  locale
}: {
  employeeId: string,
  onClose: () => void,
  locale: string
}) {
  const [isPending, startTransition] = useTransition()
  const t = useTranslations('Team.shiftsTab')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    start_at: '',
    end_at: '',
    type: 'work' as 'work' | 'break' | 'time_off',
    notes: ''
  })

  // Clear error when dates change to allow the user to fix the issue
  useEffect(() => {
    setErrorMessage(null)
  }, [formData.start_at, formData.end_at])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    // Time validation (End must be after Start)
    if (new Date(formData.end_at) <= new Date(formData.start_at)) {
      setErrorMessage(t('errorTime'))
      return
    }

    startTransition(async () => {
      try {
        // Convert to ISO before transmission for database consistency
        const startISO = new Date(formData.start_at).toISOString()
        const endISO = new Date(formData.end_at).toISOString()

        await createShiftAction({
          ...formData,
          start_at: startISO,
          end_at: endISO,
          employee_id: employeeId
        }, locale)
        onClose()
      } catch (error: any) {
        // Display the standardized error message from the Server Action
        setErrorMessage(error.message)
      }
    })
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-[2px] animate-in fade-in duration-300">
      <div
        className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-5 duration-500"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{t('newShift')}</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-0.5">Programar Disponibilidad</p>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 hover:bg-slate-50 rounded-2xl transition-all text-slate-400 hover:text-slate-900 border border-transparent hover:border-slate-100 active:scale-90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-10 py-10 space-y-8">
          {/* Error Banner - Displayed inline for better UX */}
          {errorMessage && (
            <div className="bg-rose-50 border-2 border-rose-100 p-4 rounded-2xl flex items-start gap-3 text-rose-700 text-sm font-bold animate-in fade-in zoom-in-95">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{t('start')}</label>
              <div className="relative group">
                <input
                  type="datetime-local"
                  required
                  value={formData.start_at}
                  onChange={(e) => setFormData({ ...formData, start_at: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 rounded-[20px] bg-slate-50 border-2 border-transparent text-sm font-bold text-slate-900 focus:bg-white focus:border-indigo-500/20 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
                />
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{t('end')}</label>
              <div className="relative group">
                <input
                  type="datetime-local"
                  required
                  value={formData.end_at}
                  onChange={(e) => setFormData({ ...formData, end_at: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 rounded-[20px] bg-slate-50 border-2 border-transparent text-sm font-bold text-slate-900 focus:bg-white focus:border-indigo-500/20 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
                />
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{t('type')}</label>
            <div className="flex gap-2 p-2 bg-slate-50 rounded-[20px]">
              {(['work', 'break', 'time_off'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, type })}
                  className={`flex-1 py-3.5 rounded-[14px] text-xs font-black transition-all uppercase tracking-wider ${formData.type === type
                      ? 'bg-white text-indigo-600 shadow-md ring-1 ring-indigo-500/5'
                      : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100/50'
                    }`}
                >
                  {t(type)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{t('notes')}</label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-5 py-4 rounded-[20px] bg-slate-50 border-2 border-transparent text-sm font-bold text-slate-900 focus:bg-white focus:border-indigo-500/20 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none resize-none placeholder:text-slate-300"
              placeholder="Escribe algún detalle relevante..."
            />
          </div>

          <div className="pt-6 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-4 bg-slate-100 text-slate-500 rounded-[20px] text-sm font-black hover:bg-slate-200 transition-all active:scale-95"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 bg-indigo-600 shadow-2xl shadow-indigo-200 text-white px-8 py-4 rounded-[20px] text-sm font-black hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-5 h-5" />}
              {t('newShift')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
