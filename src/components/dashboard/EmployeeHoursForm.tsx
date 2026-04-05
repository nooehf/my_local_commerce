'use client'

import { useState, useTransition, useEffect, useMemo } from 'react'
import { Clock, CheckCircle2, AlertCircle, Save, Loader2, Plus, Trash2, Calendar, ChevronLeft, ChevronRight, LayoutTemplate, Info, XCircle, MinusCircle } from 'lucide-react'
import { updateEmployeeScheduleAction, EmployeeHour, EmployeeException, EmployeePeriod } from '@/lib/settings/employeeActions'
import { BusinessHour, BusinessException } from '@/lib/settings/actions'
import { useTranslations } from 'next-intl'

interface Props {
  employeeId: string
  initialHours: EmployeeHour[]
  initialExceptions: EmployeeException[]
  businessHours: BusinessHour[]
  businessExceptions: BusinessException[]
  locale: string
}

type Mode = 'template' | 'week'

export default function EmployeeHoursForm({ 
  employeeId, 
  initialHours, 
  initialExceptions, 
  businessHours, 
  businessExceptions, 
  locale 
}: Props) {
  const t = useTranslations('BusinessSettings')
  
  const [mode, setMode] = useState<Mode>('template')
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date()
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    return new Date(d.setDate(diff))
  })

  // Ensure we have all 7 days in template even if not in DB
  const [hours, setHours] = useState<EmployeeHour[]>(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const match = initialHours.find(h => h.day_of_week === i)
      return match ? {
        ...match,
        periods: match.periods || []
      } : {
        employee_id: employeeId,
        day_of_week: i,
        is_closed: true,
        periods: []
      }
    })
  })
  const [exceptions, setExceptions] = useState<EmployeeException[]>(initialExceptions)
  
  const [isPending, startTransition] = useTransition()
  const [savingIndex, setSavingIndex] = useState<number | string | null>(null)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Helper to ensure we have all 7 days even if DB is empty
  const ensureSevenDays = (data: EmployeeHour[]) => {
    return Array.from({ length: 7 }, (_, i) => {
      const match = data.find(h => h.day_of_week === i)
      return {
        employee_id: employeeId,
        day_of_week: i,
        is_closed: match ? match.is_closed : true,
        periods: match?.periods || [],
        ...match
      }
    })
  }

  // Sync state with props when server revalidates
  useEffect(() => {
    setHours(ensureSevenDays(initialHours))
    setExceptions(initialExceptions)
  }, [initialHours, initialExceptions])

  // Memoize business hours/exceptions for the current week
  const businessWeek = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekStart)
      date.setDate(weekStart.getDate() + i)
      const dateStr = date.toISOString().split('T')[0]
      const day_of_week = date.getDay()

      const ex = businessExceptions.find(e => e.date === dateStr)
      if (ex) return { ...ex, isOverride: true }

      const std = businessHours.find(h => h.day_of_week === day_of_week)
      return {
        is_closed: std ? std.is_closed : true,
        periods: std ? std.periods : [],
        isOverride: false
      }
    })
  }, [weekStart, businessHours, businessExceptions])

  const currentWeekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekStart)
      date.setDate(weekStart.getDate() + i)
      const dateStr = date.toISOString().split('T')[0]
      const day_of_week = date.getDay()

      const ex = exceptions.find(e => e.date === dateStr)
      if (ex) return { ...ex, day_of_week, isOverride: true }

      const std = hours.find(h => h.day_of_week === day_of_week)
      return {
        date: dateStr,
        is_closed: std ? std.is_closed : true,
        periods: std ? std.periods || [] : [],
        day_of_week,
        isOverride: false
      }
    })
  }, [weekStart, hours, exceptions])

  const [weekEdits, setWeekEdits] = useState(currentWeekDays)
  
  useEffect(() => {
    if (mode === 'week') setWeekEdits(currentWeekDays)
  }, [currentWeekDays, mode])

  const handleUpdate = (dayId: number | string, field: string, value: any) => {
    setSuccess(false)
    setError(null)
    if (mode === 'template') {
      setHours(prev => prev.map(h => 
        h.day_of_week === dayId ? { ...h, [field]: value } : h
      ))
    } else {
      setWeekEdits(prev => prev.map(d => 
        d.date === dayId ? { ...d, [field]: value, isOverride: true } : d
      ))
    }
  }

  const handlePeriodUpdate = (dayId: number | string, periodIndex: number, field: keyof EmployeePeriod, value: string) => {
    if (mode === 'template') {
      setHours(prev => prev.map(h => {
        if (h.day_of_week !== dayId) return h
        const newPeriods = [...h.periods]
        newPeriods[periodIndex] = { ...newPeriods[periodIndex], [field]: value }
        return { ...h, periods: newPeriods }
      }))
    } else {
      setWeekEdits(prev => prev.map(d => {
        if (d.date !== dayId) return d
        const newPeriods = [...d.periods]
        newPeriods[periodIndex] = { ...newPeriods[periodIndex], [field]: value }
        return { ...d, periods: newPeriods, isOverride: true }
      }))
    }
  }

  const addPeriod = (dayId: number | string) => {
    const list = mode === 'template' ? hours : weekEdits
    const target = mode === 'template' 
      ? list.find((h: any) => h.day_of_week === dayId) 
      : list.find((d: any) => d.date === dayId)
    
    if (!target) return

    const lastPeriod = target.periods[target.periods.length - 1]
    const newStart = lastPeriod ? lastPeriod.close : '09:00:00'
    const newPeriod = { open: newStart, close: '18:00:00' }

    if (mode === 'template') {
      setHours(prev => prev.map(h => 
        h.day_of_week === dayId 
          ? { ...h, is_closed: false, periods: [...h.periods, newPeriod] } 
          : h
      ))
    } else {
      setWeekEdits(prev => prev.map(d => 
        d.date === dayId 
          ? { ...d, is_closed: false, isOverride: true, periods: [...d.periods, newPeriod] } 
          : d
      ))
    }
  }

  const removePeriod = (dayId: number | string, periodIndex: number) => {
    if (mode === 'template') {
      setHours(prev => prev.map(h => {
        if (h.day_of_week !== dayId) return h
        const newPeriods = h.periods.filter((_, i) => i !== periodIndex)
        return { ...h, periods: newPeriods, is_closed: newPeriods.length === 0 }
      }))
    } else {
      setWeekEdits(prev => prev.map(d => {
        if (d.date !== dayId) return d
        const newPeriods = d.periods.filter((_, i) => i !== periodIndex)
        return { ...d, periods: newPeriods, is_closed: newPeriods.length === 0, isOverride: true }
      }))
    }
  }

  const handleSave = () => {
    setError(null)
    setSuccess(false)
    startTransition(async () => {
      if (mode === 'template') {
        for (const h of hours) {
          const res = await updateEmployeeScheduleAction(employeeId, h, 'template', locale)
          if (!res.success) { setError(res.error); return }
        }
        setSuccess(true)
      } else {
        const overrides = weekEdits.filter(d => d.isOverride)
        for (const over of overrides) {
          const res = await updateEmployeeScheduleAction(employeeId, over, 'exception', locale)
          if (!res.success) { setError(res.error); return }
        }
        setSuccess(true)
      }
    })
  }

  const handleSaveDay = (dayId: number | string) => {
    setError(null)
    setSavingIndex(dayId as any)
    
    startTransition(async () => {
      const data = mode === 'template' 
        ? hours.find(h => h.day_of_week === dayId) 
        : weekEdits.find(d => d.date === dayId)
      
      const type = mode === 'template' ? 'template' : 'exception'
      
      if (!data) return

      const res = await updateEmployeeScheduleAction(employeeId, data, type, locale)
      setSavingIndex(null)
      
      if (!res.success) {
        setError(res.error)
      } else {
        // Local success feedback
        setSuccess(true)
        setTimeout(() => setSuccess(false), 2000)
      }
    })
  }

  const sortedTemplate = [...hours].sort((a, b) => (a.day_of_week === 0 ? 7 : a.day_of_week) - (b.day_of_week === 0 ? 7 : b.day_of_week))
  const displayDays = mode === 'template' ? sortedTemplate : weekEdits

  return (
    <div className="space-y-6">
      <div className="bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
          <button onClick={() => setMode('template')} className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all ${mode === 'template' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>
            <LayoutTemplate className="w-4 h-4" /> Plantilla Base
          </button>
          <button onClick={() => setMode('week')} className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all ${mode === 'week' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>
            <Calendar className="w-4 h-4" /> Calendario Semanal
          </button>
        </div>
        {mode === 'week' && (
          <div className="flex items-center gap-4">
            <button onClick={() => setWeekStart(new Date(weekStart.setDate(weekStart.getDate() - 7)))} className="p-2 border rounded-xl"><ChevronLeft className="w-4 h-4" /></button>
            <span className="text-sm font-black">{weekStart.toLocaleDateString(locale, { day: 'numeric', month: 'short' })} - {new Date(new Date(weekStart).setDate(weekStart.getDate() + 6)).toLocaleDateString(locale, { day: 'numeric', month: 'short' })}</span>
            <button onClick={() => setWeekStart(new Date(weekStart.setDate(weekStart.getDate() + 7)))} className="p-2 border rounded-xl"><ChevronRight className="w-4 h-4" /></button>
          </div>
        )}
      </div>

      <div className="grid gap-4">
        {displayDays.map((d: any, idx) => {
          const dayId = mode === 'template' ? d.day_of_week : d.date
          const biz = mode === 'template'
            ? businessHours.find(bh => bh.day_of_week === d.day_of_week) || { is_closed: true, periods: [] }
            : businessWeek[idx]
          const isBizClosed = biz.is_closed

          return (
            <div key={mode === 'template' ? d.day_of_week : d.date} className={`p-5 rounded-2xl border-2 transition-all ${d.is_closed ? 'bg-slate-50/50' : 'bg-white shadow-sm'}`}>
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${d.is_closed ? 'bg-slate-200 text-slate-500' : 'bg-indigo-50 text-indigo-600'}`}>
                    {t('days.' + d.day_of_week).substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{t('days.' + d.day_of_week)} {mode === 'week' && <span className="text-xs text-slate-400">({d.date})</span>}</p>
                    <button 
                      onClick={() => !isBizClosed && handleUpdate(dayId, 'is_closed', !d.is_closed)} 
                      disabled={isBizClosed} 
                      className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest mt-1 px-3 py-1.5 rounded-xl transition-all ${
                        isBizClosed ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 
                        d.is_closed ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                      }`}
                    >
                      {isBizClosed ? (
                        <> <XCircle className="w-3.5 h-3.5" /> El negocio no abre </>
                      ) : d.is_closed ? (
                        <> <MinusCircle className="w-3.5 h-3.5" /> No trabaja (Pulsa para asignar) </>
                      ) : (
                        <> <CheckCircle2 className="w-3.5 h-3.5" /> Trabaja (Pulsa para quitar) </>
                      )}
                    </button>
                    {d.isOverride && <span className="ml-2 bg-indigo-100 text-indigo-600 px-1 py-0.5 rounded text-[8px] font-black uppercase">Personalizado</span>}
                  </div>
                </div>

                {!d.is_closed && !isBizClosed && (
                  <div className="flex-1 max-w-lg space-y-3">
                    {/* Business Hours Reference */}
                    {mode === 'week' && biz.periods.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {biz.periods.map((bp: any, bi: number) => (
                           <span key={bi} className="px-2 py-1 bg-slate-50 border border-slate-100 rounded text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1">
                             <Clock className="w-2.5 h-2.5" /> Negocio: {bp.open.slice(0,5)}-{bp.close.slice(0,5)}
                           </span>
                        ))}
                      </div>
                    )}

                    {d.periods.map((p: any, pi: number) => {
                      const isInvalid = biz.periods.length > 0 && !biz.periods.some((bp: any) => p.open >= bp.open && p.close <= bp.close)
                      return (
                        <div key={pi} className="space-y-1">
                          <div className="flex gap-3">
                            <input type="time" value={p.open.slice(0,5)} onChange={(e) => handlePeriodUpdate(dayId, pi, 'open', e.target.value+':00')} className={`w-full p-2.5 rounded-xl border-2 transition-all ${isInvalid ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-slate-50 border-transparent text-slate-900 font-bold'}`} />
                            <span className="text-slate-300 self-center">/</span>
                            <input type="time" value={p.close.slice(0,5)} onChange={(e) => handlePeriodUpdate(dayId, pi, 'close', e.target.value+':00')} className={`w-full p-2.5 rounded-xl border-2 transition-all ${isInvalid ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-slate-50 border-transparent text-slate-900 font-bold'}`} />
                            <button onClick={() => removePeriod(dayId, pi)} className="p-2 text-slate-300 hover:text-rose-500"><Trash2 className="w-4 h-4" /></button>
                          </div>
                          {isInvalid && (
                            <p className="text-[10px] font-bold text-rose-600 flex items-center gap-1 animate-pulse px-1">
                              <AlertCircle className="w-3 h-3" /> Fuera del horario de negocio
                            </p>
                          )}
                        </div>
                      )
                    })}
                    <div className="flex gap-2">
                      <button onClick={() => addPeriod(dayId)} className="flex-1 py-2 border-2 border-dashed border-slate-100 rounded-xl text-[10px] font-black text-slate-400 uppercase hover:bg-slate-50">+ Añadir Turno</button>
                      <button 
                        onClick={() => handleSaveDay(dayId)} 
                        disabled={savingIndex === dayId}
                        className="px-4 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all flex items-center justify-center disabled:opacity-50"
                        title="Guardar este día"
                      >
                        {savingIndex === dayId ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}
                
                {isBizClosed && (
                  <div className="flex-1 flex items-center justify-end pr-4 text-slate-400 font-black text-[10px] uppercase gap-1.5">
                    No se pueden añadir turnos si el negocio no abre
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {error && (
        <div className="bg-rose-50 border-2 border-rose-100 p-4 rounded-2xl flex items-start gap-3 text-rose-700 text-sm font-bold">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex justify-end pt-6">
        <button onClick={handleSave} disabled={isPending} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl text-sm font-black uppercase shadow-xl hover:bg-indigo-700 disabled:opacity-50 transition-all active:scale-95">
          {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verificar y Guardar'}
        </button>
      </div>

      {/* Success Modal */}
      {success && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-8 shadow-2xl w-full max-w-sm text-center animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">¡Todo Correcto!</h3>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed">Los horarios han sido verificados y guardados correctamente en el sistema.</p>
            <button 
              onClick={() => {
                setSuccess(false)
                if (mode === 'week') window.location.reload()
              }} 
              className="w-full py-4 bg-slate-900 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-slate-800 transition-all"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
