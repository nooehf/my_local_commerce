import { CreditCard, Store, User, Bell } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-slate-900">Configuración</h1>
          <p className="mt-2 text-sm text-slate-700">
            Gestiona los detalles de tu negocio, suscripción y preferencias de equipo.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-6">
         {/* Perfil del Negocio */}
         <div className="border-b border-slate-200 px-6 py-5">
            <h3 className="text-base font-medium leading-6 text-slate-900 flex items-center">
               <Store className="w-5 h-5 mr-2 text-slate-400" />
               Información del Negocio
            </h3>
         </div>
         <div className="px-6 py-6 space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
               <div>
                  <label className="block text-sm font-medium leading-6 text-slate-900">Nombre del Negocio</label>
                  <input type="text" defaultValue="Peluquería Estilo" className="mt-2 block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6" />
               </div>
               <div>
                  <label className="block text-sm font-medium leading-6 text-slate-900">Email de Contacto</label>
                  <input type="email" defaultValue="contacto@peluqueriaestilo.com" className="mt-2 block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6" />
               </div>
            </div>
            <div className="flex justify-end">
               <button className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700">
                  Guardar Cambios
               </button>
            </div>
         </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-6">
         {/* Suscripción */}
         <div className="border-b border-slate-200 px-6 py-5">
            <h3 className="text-base font-medium leading-6 text-slate-900 flex items-center">
               <CreditCard className="w-5 h-5 mr-2 text-slate-400" />
               Suscripción y Pagos
            </h3>
         </div>
         <div className="px-6 py-6 flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
            <div>
               <p className="text-sm font-medium text-slate-900">Plan Actual: <span className="text-indigo-600">Pro</span></p>
               <p className="text-sm text-slate-500 mt-1">Tu próximo pago de $79.00 será el 21 de Abril de 2026.</p>
            </div>
            <div className="flex gap-3">
               <button className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-50">
                  Ver Facturas
               </button>
               <button className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700">
                  Gestionar Plan
               </button>
            </div>
         </div>
      </div>
    </div>
  )
}
