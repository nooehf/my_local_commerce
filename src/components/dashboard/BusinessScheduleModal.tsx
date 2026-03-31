'use client'

import { useState } from 'react'
import { Calendar, X, ChevronLeft, ChevronRight, Clock, Info } from 'lucide-react'
import { BusinessHour, BusinessException } from '@/lib/settings/actions'
import { useTranslations } from 'next-intl'

interface Props {
  standardHours: BusinessHour[]
  exceptions: BusinessException[]
  locale: string
}

export default function BusinessScheduleModal({ standardHours, exceptions, locale }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const t = useTranslations('CalendarModal')
  const commonT = useTranslations('BusinessSettings')

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay()

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  const getDayInfo = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const dayOfWeek = new Date(year, month, day).getDay()
    
    // 1. Check exceptions first
    const exception = exceptions.find(ex => ex.date === dateStr)
    if (exception) {
      return {
        isClosed: exception.is_closed,
        periods: exception.periods,
        reason: exception.reason,
        isException: true
      }
    }

    // 2. Check standard hours
    const standard = standardHours.find(h => h.day_of_week === dayOfWeek)
    return {
      isClosed: standard ? standard.is_closed : true,
      periods: standard ? standard.periods : [],
      reason: null,
      isException: false
    }
  }

  const monthName = currentDate.toLocaleDateString(locale, { month: 'long', year: 'numeric' })
  const dayNames = Array.from({ length: 7 }, (_, i) => {
    // 1 = Monday in this calculation
    const date = new Date(2024, 0, i + 1) // Jan 1st 2024 was a Monday
    return date.toLocaleDateString(locale, { weekday: 'narrow' })
  })

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-slate-100 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 hover:border-indigo-200 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all active:scale-95 shadow-sm"
      >
        <Calendar className="w-4 h-4" />
        {t('trigger')}
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-50 bg-slate-50/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100">
              <Calendar className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">{t('title')}</h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-all hover:rotate-90"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Calendar Nav */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black text-slate-900 capitalize">{monthName}</h3>
            <div className="flex gap-2">
              <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-all"><ChevronLeft className="w-5 h-5" /></button>
              <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-all"><ChevronRight className="w-5 h-5" /></button>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-7 gap-2 mb-6">
            {dayNames.map((name, i) => (
              <div key={i} className="text-center text-[10px] font-black text-slate-300 uppercase mb-2">{name}</div>
            ))}
            {Array.from({ length: (firstDayOfMonth(year, month) + 6) % 7 }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth(year, month) }).map((_, i) => {
              const day = i + 1
              const info = getDayInfo(day)
              const isToday = new Date().toDateString() === new Date(year, month, day).toDateString()
              
              return (
                <div
                  key={day}
                  title={info.isClosed ? (info.reason || commonT('closed')) : info.periods.map(p => `${p.open.slice(0,5)}-${p.close.slice(0,5)}`).join(', ')}
                  className={`relative group aspect-square flex flex-col items-center justify-center rounded-xl text-xs font-bold transition-all cursor-default ${
                    info.isClosed 
                      ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' 
                      : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                  } ${isToday ? 'ring-2 ring-indigo-500 ring-offset-2' : ''} ${info.isException ? 'border-2 border-indigo-200' : ''}`}
                >
                  {day}
                  {info.isException && <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-indigo-500" />}
                  
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[200px] p-2 bg-slate-900 text-white rounded-lg text-[10px] leading-tight opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-10 shadow-xl">
                    <p className="font-black mb-1">{info.isClosed ? commonT('closed').toUpperCase() : commonT('opened').toUpperCase()}</p>
                    {!info.isClosed && info.periods.map((p, idx) => (
                      <p key={idx} className="opacity-80 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" /> {p.open.slice(0,5)} - {p.close.slice(0,5)}
                      </p>
                    ))}
                    {info.reason && <p className="mt-1 text-indigo-300 italic">"{info.reason}"</p>}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900" />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 pt-6 border-t border-slate-50">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-md bg-emerald-100 border border-emerald-200" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('open')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-md bg-rose-100 border border-rose-200" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('closed')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-md border-2 border-indigo-200 bg-white" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('exception')}</span>
            </div>
          </div>
        </div>

        <div className="p-6 bg-indigo-50/50 flex items-center gap-3">
           <Info className="w-4 h-4 text-indigo-400 shrink-0" />
           <p className="text-[10px] text-indigo-700/70 font-medium leading-relaxed">
             {t('help')}
           </p>
        </div>
      </div>
    </div>
  )
}
