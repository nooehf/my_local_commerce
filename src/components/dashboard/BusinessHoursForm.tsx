'use client'

import { useState, useTransition, useEffect, useMemo } from 'react'
import { Clock, CheckCircle2, AlertCircle, Save, Loader2, Plus, Trash2, Calendar, ChevronLeft, ChevronRight, LayoutTemplate } from 'lucide-react'
import { updateBusinessHoursAction, createExceptionAction, BusinessHour, BusinessException, BusinessPeriod } from '@/lib/settings/actions'
import { useTranslations } from 'next-intl'

interface Props {
  initialHours: BusinessHour[]
  initialExceptions: BusinessException[]
  locale: string
}

type Mode = 'template' | 'week'

export default function BusinessHoursForm({ initialHours, initialExceptions, locale }: Props) {
  const t = useTranslations('BusinessSettings')
  const exT = useTranslations('BusinessExceptions')
  
  const [mode, setMode] = useState<Mode>('template')
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date()
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust to Monday
    return new Date(d.setDate(diff))
  })

  // State for current edits
  const [hours, setHours] = useState<BusinessHour[]>(initialHours)
  const [exceptions, setExceptions] = useState<BusinessException[]>(initialExceptions)
  
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Memoize current display days
  const currentWeekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekStart)
      date.setDate(weekStart.getDate() + i)
      const dateStr = date.toISOString().split('T')[0]
      const day_of_week = date.getDay()

      // Look for exception
      const ex = exceptions.find(e => e.date === dateStr)
      if (ex) return { ...ex, day_of_week, isOverride: true }

      // Look for standard
      const std = hours.find(h => h.day_of_week === day_of_week)
      return {
        date: dateStr,
        is_closed: std ? std.is_closed : true,
        periods: std ? std.periods : [],
        reason: null,
        day_of_week,
        isOverride: false
      }
    })
  }, [weekStart, hours, exceptions])

  // State for current week edits (local copy)
  const [weekEdits, setWeekEdits] = useState(currentWeekDays)
  
  useEffect(() => {
    if (mode === 'week') {
      setWeekEdits(currentWeekDays)
    }
  }, [currentWeekDays, mode])

  const handleUpdate = (index: number, field: string, value: any) => {
    setSuccess(false)
    setError(null)

    if (mode === 'template') {
      const newHours = [...hours]
      newHours[index] = { ...newHours[index], [field]: value }
      setHours(newHours)
    } else {
      const newEdits = [...weekEdits]
      newEdits[index] = { ...newEdits[index], [field]: value, isOverride: true }
      setWeekEdits(newEdits)
    }
  }

  const handlePeriodUpdate = (dayIndex: number, periodIndex: number, field: keyof BusinessPeriod, value: string) => {
    if (mode === 'template') {
      const newHours = [...hours]
      const newPeriods = [...newHours[dayIndex].periods]
      newPeriods[periodIndex] = { ...newPeriods[periodIndex], [field]: value }
      newHours[dayIndex] = { ...newHours[dayIndex], periods: newPeriods }
      setHours(newHours)
    } else {
      const newEdits = [...weekEdits]
      const newPeriods = [...newEdits[dayIndex].periods]
      newPeriods[periodIndex] = { ...newPeriods[periodIndex], [field]: value }
      newEdits[dayIndex] = { ...newEdits[dayIndex], periods: newPeriods, isOverride: true }
      setWeekEdits(newEdits)
    }
  }

  const addPeriod = (dayIndex: number) => {
    if (mode === 'template') {
      const newHours = [...hours]
      const lastPeriod = newHours[dayIndex].periods[newHours[dayIndex].periods.length - 1]
      const newStart = lastPeriod ? lastPeriod.close : '09:00:00'
      newHours[dayIndex].periods.push({ open: newStart, close: '18:00:00' })
      newHours[dayIndex].is_closed = false
      setHours(newHours)
    } else {
      const newEdits = [...weekEdits]
      const lastPeriod = newEdits[dayIndex].periods[newEdits[dayIndex].periods.length - 1]
      const newStart = lastPeriod ? lastPeriod.close : '09:00:00'
      newEdits[dayIndex].periods.push({ open: newStart, close: '18:00:00' })
      newEdits[dayIndex].is_closed = false
      newEdits[dayIndex].isOverride = true
      setWeekEdits(newEdits)
    }
  }

  const removePeriod = (dayIndex: number, periodIndex: number) => {
    if (mode === 'template') {
      const newHours = [...hours]
      newHours[dayIndex].periods.splice(periodIndex, 1)
      if (newHours[dayIndex].periods.length === 0) newHours[dayIndex].is_closed = true
      setHours(newHours)
    } else {
      const newEdits = [...weekEdits]
      newEdits[dayIndex].periods.splice(periodIndex, 1)
      if (newEdits[dayIndex].periods.length === 0) newEdits[dayIndex].is_closed = true
      newEdits[dayIndex].isOverride = true
      setWeekEdits(newEdits)
    }
  }

  const handleSave = () => {
    setError(null)
    setSuccess(false)

    startTransition(async () => {
      if (mode === 'template') {
        const result = await updateBusinessHoursAction(hours, locale)
        if (result.success) setSuccess(true)
        else setError(result.error)
      } else {
        // Save all days that were touched
        const overrides = weekEdits.filter(d => d.isOverride)
        for (const over of overrides) {
          const result = await createExceptionAction(over, locale)
          if (!result.success) {
            setError(`Error guardando ${over.date}: ${result.error}`)
            return
          }
        }
        setSuccess(true)
        window.location.reload()
      }
    })
  }

  const changeWeek = (dir: number) => {
    const newStart = new Date(weekStart)
    newStart.setDate(weekStart.getDate() + (dir * 7))
    setWeekStart(newStart)
    setMode('week')
  }

  // Sort template hours to start from Monday (1) to Sunday (0)
  const sortedHours = useMemo(() => {
    return [...hours].sort((a, b) => {
      const orderA = a.day_of_week === 0 ? 7 : a.day_of_week
      const orderB = b.day_of_week === 0 ? 7 : b.day_of_week
      return orderA - orderB
    })
  }, [hours])

  const displayDays = mode === 'template' ? sortedHours : weekEdits

  return (
    <div className="space-y-8">
      {/* Week Selector Header */}
      <div className="bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
          <button
            onClick={() => setMode('template')}
            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all ${
              mode === 'template' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'
            }`}
          >
            <LayoutTemplate className="w-4 h-4" />
            Plantilla Base
          </button>
          <button
            onClick={() => setMode('week')}
            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all ${
              mode === 'week' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Calendario Semanal
          </button>
        </div>

        {mode === 'week' && (
          <div className="flex items-center gap-4">
            <button
              onClick={() => changeWeek(-1)}
              className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 transition-all active:scale-90"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-black text-slate-700 min-w-[180px] text-center">
              {weekStart.toLocaleDateString(locale, { day: 'numeric', month: 'short' })} - {new Date(new Date(weekStart).setDate(weekStart.getDate() + 6)).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            <button
              onClick={() => changeWeek(1)}
              className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 transition-all active:scale-90"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {mode === 'week' && (
        <div className="bg-indigo-50 border-2 border-indigo-100 p-4 rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
          <p className="text-xs text-indigo-700 font-bold leading-relaxed">
            Estás editando una semana específica. Los cambios se guardarán como una excepción para esas fechas sin cambiar tu horario semanal habitual.
          </p>
        </div>
      )}

      {/* Grid of Days */}
      <div className="grid grid-cols-1 gap-4">
        {displayDays.map((d: any, index) => (
          <div
            key={mode === 'template' ? d.day_of_week : d.date}
            className={`flex flex-col p-5 rounded-2xl border-2 transition-all ${
              d.is_closed 
                ? 'bg-slate-50/50 border-slate-100 opacity-70' 
                : 'bg-white border-slate-100 hover:border-indigo-100 shadow-sm'
            }`}
          >
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                  d.is_closed ? 'bg-slate-200 text-slate-500' : 'bg-indigo-50 text-indigo-600'
                }`}>
                  {t('days.' + d.day_of_week).substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 leading-tight">
                    {t('days.' + d.day_of_week)}
                    {mode === 'week' && <span className="ml-2 text-xs text-slate-400 font-medium">({new Date(d.date).toLocaleDateString(locale, { day: 'numeric', month: 'short' })})</span>}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleUpdate(index, 'is_closed', !d.is_closed)}
                    className={`text-[10px] font-black uppercase tracking-widest mt-0.5 flex items-center gap-1.5 ${
                      d.is_closed ? 'text-rose-500 hover:text-rose-600' : 'text-emerald-500 hover:text-emerald-600'
                    }`}
                  >
                    {d.is_closed ? t('closed') : t('opened')}
                    {d.isOverride && <span className="bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded text-[8px] font-black">Personalizado</span>}
                  </button>
                </div>
              </div>

              {!d.is_closed && (
                <div className="flex flex-col gap-3 flex-1 max-w-lg">
                  {d.periods.map((p: any, periodIndex: number) => (
                    <div key={periodIndex} className="flex items-center gap-3">
                      <div className="relative group flex-1">
                        <input
                          type="time"
                          value={p.open?.slice(0, 5) || '09:00'}
                          onChange={(e) => handlePeriodUpdate(index, periodIndex, 'open', e.target.value + ':00')}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border-2 border-transparent text-sm font-bold text-slate-900 focus:bg-white focus:border-indigo-500/20 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
                        />
                        <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
                      </div>
                      <span className="text-slate-300 font-bold">/</span>
                      <div className="relative group flex-1">
                        <input
                          type="time"
                          value={p.close?.slice(0, 5) || '18:00'}
                          onChange={(e) => handlePeriodUpdate(index, periodIndex, 'close', e.target.value + ':00')}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border-2 border-transparent text-sm font-bold text-slate-900 focus:bg-white focus:border-indigo-500/20 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
                        />
                        <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
                      </div>
                      <button
                        type="button"
                        onClick={() => removePeriod(index, periodIndex)}
                        className="p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={() => addPeriod(index)}
                    className="flex items-center justify-center gap-2 py-2 border-2 border-dashed border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:border-indigo-200 hover:text-indigo-500 hover:bg-indigo-50/30 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Añadir Turno
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-rose-50 border-2 border-rose-100 p-4 rounded-2xl flex items-start gap-3 text-rose-700 text-sm font-bold animate-in fade-in zoom-in-95">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border-2 border-emerald-100 p-4 rounded-2xl flex items-start gap-3 text-emerald-700 text-sm font-bold animate-in fade-in zoom-in-95">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{t('saveSuccess')}</span>
        </div>
      )}

      <div className="flex justify-end p-6 bg-slate-50 rounded-3xl border-2 border-white shadow-inner">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-10 py-4 text-sm font-black text-white shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-60"
        >
          {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {isPending ? 'Guardando...' : (mode === 'template' ? 'Guardar Plantilla Base' : 'Guardar Cambios de esta Semana')}
        </button>
      </div>
    </div>
  )
}
