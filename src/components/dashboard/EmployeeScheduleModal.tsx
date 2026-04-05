'use client'

import { useState } from 'react'
import { Calendar, X, ChevronLeft, ChevronRight, Clock, Info } from 'lucide-react'
import { EmployeeHour, EmployeeException } from '@/lib/settings/employeeActions'
import { BusinessHour, BusinessException } from '@/lib/settings/actions'
import { useTranslations } from 'next-intl'

interface Props {
  standardHours: EmployeeHour[]
  exceptions: EmployeeException[]
  businessHours: BusinessHour[]
  businessExceptions: BusinessException[]
  locale: string
}

export default function EmployeeScheduleModal({ 
  standardHours, 
  exceptions, 
  businessHours, 
  businessExceptions, 
  locale 
}: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const t = useTranslations('CalendarModal')
  const commonT = useTranslations('BusinessSettings')

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay()

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const getDayInfo = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const day_of_week = new Date(year, month, day).getDay()
    
    // Business status
    const bEx = businessExceptions.find(ex => ex.date === dateStr)
    const bIsClosed = bEx ? bEx.is_closed : (businessHours.find(h => h.day_of_week === day_of_week)?.is_closed ?? true)

    // Employee status
    const ex = exceptions.find(ex => ex.date === dateStr)
    const info = ex ? { 
      isClosed: ex.is_closed, 
      periods: ex.periods, 
      isException: true 
    } : {
      isClosed: standardHours.find(h => h.day_of_week === day_of_week)?.is_closed ?? true,
      periods: standardHours.find(h => h.day_of_week === day_of_week)?.periods ?? [],
      isException: false
    }

    return { ...info, bIsClosed }
  }

  const monthName = currentDate.toLocaleDateString(locale, { month: 'long', year: 'numeric' })

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-slate-100 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 hover:border-indigo-200 hover:text-indigo-600 transition-all shadow-sm">
        <Calendar className="w-4 h-4" /> {t('trigger')}
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between p-6 border-b border-slate-50 bg-slate-50/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white"><Calendar className="w-5 h-5" /></div>
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">{t('title')}</h2>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-all"><X className="w-6 h-6" /></button>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black text-slate-900 capitalize">{monthName}</h3>
            <div className="flex gap-2">
              <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-2 border rounded-lg"><ChevronLeft className="w-5 h-5" /></button>
              <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-2 border rounded-lg"><ChevronRight className="w-5 h-5" /></button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-6">
            {Array.from({ length: (firstDayOfMonth(year, month) + 6) % 7 }).map((_, i) => <div key={i} />)}
            {Array.from({ length: daysInMonth(year, month) }).map((_, i) => {
              const day = i + 1
              const info = getDayInfo(day)
              const isToday = new Date().toDateString() === new Date(year, month, day).toDateString()

              let bgColor = 'bg-slate-50 text-slate-300' // No trabaja
              if (info.bIsClosed) bgColor = 'bg-rose-50 text-rose-300' // Negocio cerrado
              else if (!info.isClosed) bgColor = 'bg-emerald-50 text-emerald-600' // Trabaja
              
              return (
                <div key={day} className={`relative group aspect-square flex items-center justify-center rounded-xl text-xs font-bold transition-all ${bgColor} ${isToday ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`}>
                   {day}
                   {info.isException && <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-indigo-500" />}
                   
                   <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[200px] p-2 bg-slate-900 text-white rounded-lg text-[10px] leading-tight opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-10 shadow-xl">
                      <p className="font-black mb-1">{info.bIsClosed ? 'NEGOCIO CERRADO' : info.isClosed ? 'NO TRABAJA' : 'TRABAJA'}</p>
                      {!info.isClosed && !info.bIsClosed && info.periods.map((p, idx) => (
                        <p key={idx} className="opacity-80 font-medium">{p.open.slice(0,5)} - {p.close.slice(0,5)}</p>
                      ))}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900" />
                   </div>
                </div>
              )
            })}
          </div>

          <div className="flex flex-wrap gap-4 pt-6 border-t border-slate-50">
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-emerald-50 border border-emerald-200" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Trabaja</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-slate-50 border border-slate-200" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No trabaja</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-rose-50 border border-rose-200" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">El negocio no abre</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
