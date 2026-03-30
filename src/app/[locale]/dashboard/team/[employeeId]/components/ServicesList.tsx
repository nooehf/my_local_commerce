'use client'

import { useState, useTransition } from 'react'
import { Check, Plus, Loader2, Edit2, Save } from 'lucide-react'
import { assignServiceAction, unassignServiceAction, updateServiceOverrideAction } from '@/lib/team/actions'
import { useTranslations } from 'next-intl'

export default function ServicesList({ 
  employeeId, 
  allServices, 
  employeeSkills, 
  locale 
}: { 
  employeeId: string, 
  allServices: any[], 
  employeeSkills: any[], 
  locale: string 
}) {
  const [isPending, startTransition] = useTransition()
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null)
  const t = useTranslations('Team.servicesTab')
  
  // Local state for override form (temp)
  const [tempDuration, setTempDuration] = useState<number | null>(null)
  const [tempPrice, setTempPrice] = useState<number | null>(null)

  const handleToggle = (serviceId: string, isAssigned: boolean) => {
    startTransition(async () => {
      try {
        if (isAssigned) {
          await unassignServiceAction(employeeId, serviceId, locale)
        } else {
          await assignServiceAction(employeeId, serviceId, locale)
        }
      } catch (error: any) {
        alert(error.message)
      }
    })
  }

  const handleStartEdit = (skill: any) => {
    setEditingServiceId(skill.service_id)
    setTempDuration(skill.duration_minutes_override)
    setTempPrice(skill.price_override)
  }

  const handleSaveOverride = (serviceId: string) => {
    startTransition(async () => {
      try {
        await updateServiceOverrideAction(employeeId, serviceId, {
          duration_minutes_override: tempDuration,
          price_override: tempPrice
        }, locale)
        setEditingServiceId(null)
      } catch (error: any) {
        alert(error.message)
      }
    })
  }

  return (
    <div className="space-y-4">
      {allServices.map((service) => {
        const skill = employeeSkills.find(s => s.service_id === service.id)
        const isAssigned = !!skill
        const isEditing = editingServiceId === service.id

        return (
          <div 
            key={service.id} 
            className={`p-5 rounded-2xl border transition-all duration-300 ${
              isAssigned ? 'bg-indigo-50/40 border-indigo-100 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleToggle(service.id, isAssigned)}
                  disabled={isPending}
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all active:scale-90 ${
                    isAssigned 
                      ? 'bg-indigo-600 text-white shadow-md' 
                      : 'bg-white border-2 border-slate-200 text-slate-300 hover:border-indigo-400 hover:text-indigo-400'
                  }`}
                >
                  {isAssigned ? (
                    isPending && editingServiceId === null ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-4 h-4" />
                  ) : <Plus className="w-4 h-4" />}
                </button>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{service.name}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                      {isAssigned && skill.duration_minutes_override ? (
                        <span className="text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                          {skill.duration_minutes_override} {t('duration')}
                        </span>
                      ) : (
                        <span>{service.duration_minutes} {t('duration')}</span>
                      )}
                    </span>
                    <span className="text-slate-200">|</span>
                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                      {isAssigned && skill.price_override ? (
                        <span className="text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                          {skill.price_override} {service.currency}
                        </span>
                      ) : (
                        <span>{service.price} {service.currency}</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {isAssigned && !isEditing && (
                <button 
                  onClick={() => handleStartEdit(skill)}
                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all active:scale-95 border border-transparent hover:border-indigo-50"
                  title={t('override')}
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {isEditing && (
                <div className="mt-6 pt-6 border-t border-indigo-100 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Duración (minutos)</label>
                            <input 
                                type="number" 
                                value={tempDuration || ''} 
                                onChange={(e) => setTempDuration(e.target.value ? parseInt(e.target.value) : null)}
                                placeholder={service.duration_minutes}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Precio Personalizado ({service.currency})</label>
                            <input 
                                type="number" 
                                step="0.01"
                                value={tempPrice || ''} 
                                onChange={(e) => setTempPrice(e.target.value ? parseFloat(e.target.value) : null)}
                                placeholder={service.price}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3">
                        <button 
                            onClick={() => setEditingServiceId(null)}
                            className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-all"
                        >
                            {t('cancel')}
                        </button>
                        <button 
                            onClick={() => handleSaveOverride(service.id)}
                            disabled={isPending}
                            className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-100 flex items-center gap-2 disabled:opacity-50 active:scale-95"
                        >
                            {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                            {t('saveOverride')}
                        </button>
                    </div>
                </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
