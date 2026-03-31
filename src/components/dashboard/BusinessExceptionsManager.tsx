'use client'

import { useState, useTransition } from 'react'
import { Calendar, Clock, Trash2, Plus, Loader2, AlertCircle, Save, CheckCircle2, X } from 'lucide-react'
import { createExceptionAction, deleteExceptionAction, BusinessException, BusinessPeriod } from '@/lib/settings/actions'
import { useTranslations } from 'next-intl'

interface Props {
  initialExceptions: BusinessException[]
  locale: string
}

export default function BusinessExceptionsManager({ initialExceptions, locale }: Props) {
  const t = useTranslations('BusinessExceptions')
  const commonT = useTranslations('BusinessSettings')
  const [isPending, startTransition] = useTransition()
  const [showAddForm, setShowAddForm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [newException, setNewException] = useState<BusinessException>({
    date: '',
    is_closed: true,
    reason: '',
    periods: [{ open: '09:00:00', close: '18:00:00' }]
  })

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newException.date) return

    startTransition(async () => {
      const result = await createExceptionAction(newException, locale)
      if (result.success) {
        setShowAddForm(false)
        setNewException({
          date: '',
          is_closed: true,
          reason: '',
          periods: [{ open: '09:00:00', close: '18:00:00' }]
        })
        window.location.reload()
      } else {
        setError(result.error)
      }
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('deleteConfirm'))) return

    startTransition(async () => {
      const result = await deleteExceptionAction(id, locale)
      if (result.success) {
        window.location.reload()
      }
    })
  }

  const addPeriod = () => {
    const lastPeriod = newException.periods[newException.periods.length - 1]
    const newStart = lastPeriod ? lastPeriod.close : '09:00:00'
    setNewException({
      ...newException,
      periods: [...newException.periods, { open: newStart, close: '18:00:00' }],
      is_closed: false
    })
  }

  const removePeriod = (index: number) => {
    const newPeriods = [...newException.periods]
    newPeriods.splice(index, 1)
    setNewException({
      ...newException,
      periods: newPeriods,
      is_closed: newPeriods.length === 0
    })
  }

  const updatePeriod = (index: number, field: keyof BusinessPeriod, value: string) => {
    const newPeriods = [...newException.periods]
    newPeriods[index] = { ...newPeriods[index], [field]: value }
    setNewException({ ...newException, periods: newPeriods })
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-500" />
          {t('title')}
        </h3>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-100 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            {t('addException')}
          </button>
        )}
      </div>

      {/* Add Form */}
      {showAddForm && (
        <form onSubmit={handleAdd} className="bg-slate-50 border-2 border-slate-100 rounded-2xl p-6 space-y-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{t('date')}</label>
              <input
                type="date"
                required
                value={newException.date}
                onChange={(e) => setNewException({ ...newException, date: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white border-2 border-transparent text-sm font-bold text-slate-900 focus:border-indigo-500/20 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{t('reason')}</label>
              <input
                type="text"
                placeholder={t('reasonPlaceholder')}
                value={newException.reason || ''}
                onChange={(e) => setNewException({ ...newException, reason: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white border-2 border-transparent text-sm font-bold text-slate-900 focus:border-indigo-500/20 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{commonT('status')}</label>
               <div className="flex gap-2 p-1.5 bg-white rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setNewException({ ...newException, is_closed: false })}
                    className={`px-4 py-2 rounded-lg text-xs font-black tracking-widest uppercase transition-all ${!newException.is_closed ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
                  >
                    {commonT('opened')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewException({ ...newException, is_closed: true, periods: [] })}
                    className={`px-4 py-2 rounded-lg text-xs font-black tracking-widest uppercase transition-all ${newException.is_closed ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
                  >
                    {commonT('closed')}
                  </button>
               </div>
            </div>

            {!newException.is_closed && (
              <div className="space-y-3">
                {newException.periods.map((p, index) => (
                  <div key={index} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-100 animate-in fade-in zoom-in-95">
                    <input
                      type="time"
                      value={p.open?.slice(0, 5) || '09:00'}
                      onChange={(e) => updatePeriod(index, 'open', e.target.value + ':00')}
                      className="w-28 px-3 py-2 rounded-lg bg-slate-50 border-transparent text-sm font-bold text-slate-900 outline-none focus:border-indigo-500"
                    />
                    <span className="text-slate-300">/</span>
                    <input
                      type="time"
                      value={p.close?.slice(0, 5) || '18:00'}
                      onChange={(e) => updatePeriod(index, 'close', e.target.value + ':00')}
                      className="w-28 px-3 py-2 rounded-lg bg-slate-50 border-transparent text-sm font-bold text-slate-900 outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => removePeriod(index)}
                      className="p-2 text-slate-300 hover:text-rose-500 transition-all hover:bg-rose-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addPeriod}
                  className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-100 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Añadir Turno
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-3 justify-end border-t border-slate-200 pt-6">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-6 py-3 bg-white border border-slate-200 text-slate-500 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-8 py-3 bg-indigo-600 text-white shadow-lg shadow-indigo-100 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center gap-2"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Guardar Excepción
            </button>
          </div>
        </form>
      )}

      {/* List of Exceptions */}
      <div className="grid grid-cols-1 gap-4">
        {initialExceptions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
            <Calendar className="w-10 h-10 text-slate-300 mb-3" />
            <p className="text-sm font-medium text-slate-400">{t('noExceptions')}</p>
          </div>
        ) : (
          initialExceptions.map((ex) => (
            <div
              key={ex.id}
              className="group flex flex-col sm:flex-row sm:items-start justify-between p-5 rounded-2xl border-2 border-slate-100 bg-white hover:border-indigo-100 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${ex.is_closed ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                  {ex.is_closed ? <X className="w-5 h-5" /> : <Clock className="w-4 h-4" />}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-black text-slate-900">
                      {new Date(ex.date).toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                    {ex.reason && (
                      <span className="px-2 py-0.5 bg-slate-100 text-[10px] font-bold text-slate-500 rounded-full uppercase tracking-tighter">
                        {ex.reason}
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-2 space-y-1">
                    {ex.is_closed ? (
                      <p className="text-[10px] font-black uppercase tracking-widest text-rose-500">{commonT('closed')}</p>
                    ) : (
                      ex.periods.map((p, idx) => (
                        <p key={idx} className="text-[10px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          {p.open?.slice(0,5)} - {p.close?.slice(0,5)}
                        </p>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => ex.id && handleDelete(ex.id)}
                className="mt-4 sm:mt-0 p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {error && (
        <div className="bg-rose-50 border-2 border-rose-100 p-4 rounded-2xl flex items-start gap-3 text-rose-700 text-sm font-bold animate-in fade-in zoom-in-95">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
