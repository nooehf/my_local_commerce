import Link from 'next/link'
import { Check } from 'lucide-react'

const plans = [
  {
    name: 'Básico',
    price: '29',
    description: 'Perfecto para negocios que están empezando.',
    features: [
      'Hasta 2 empleados',
      'Reservas ilimitadas',
      'Gestión de clientes (hasta 500)',
      'Inventario básico',
      'Soporte por email'
    ],
    cta: 'Empieza Gratis',
    highlighted: false
  },
  {
    name: 'Pro',
    price: '79',
    description: 'Para negocios en crecimiento que necesitan más control.',
    features: [
      'Hasta 10 empleados',
      'Reservas ilimitadas',
      'Clientes ilimitados',
      'Gestión de turnos',
      'Inventario avanzado',
      'Soporte prioritario'
    ],
    cta: 'Prueba Pro',
    highlighted: true
  },
  {
    name: 'Premium',
    price: '199',
    description: 'Solución completa con analítica y automatizaciones.',
    features: [
      'Empleados ilimitados',
      'Múltiples sucursales',
      'IA y analítica avanzada',
      'Marketing hiperlocal',
      'API y Webhooks',
      'Soporte 24/7 y manager dedicado'
    ],
    cta: 'Contactar Ventas',
    highlighted: false
  }
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-600">Precios</h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Planes diseñados para tu crecimiento
          </p>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-slate-600">
          Sin comisiones ocultas. Cancela cuando quieras. Todo el poder de MyLocalCommerce para digitalizar tu negocio hoy mismo.
        </p>
        <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8 lg:gap-y-0">
          {plans.map((plan, planIdx) => (
            <div
              key={plan.name}
              className={`rounded-3xl p-8 ring-1 ring-slate-200 xl:p-10 bg-white ${plan.highlighted ? 'ring-2 ring-indigo-600 shadow-xl' : 'shadow-sm'}`}
            >
              <h3 className={`text-lg font-semibold leading-8 ${plan.highlighted ? 'text-indigo-600' : 'text-slate-900'}`}>
                {plan.name}
              </h3>
              <p className="mt-4 text-sm leading-6 text-slate-600">{plan.description}</p>
              <p className="mt-6 flex items-baseline gap-x-1">
                <span className="text-4xl font-bold tracking-tight text-slate-900">${plan.price}</span>
                <span className="text-sm font-semibold leading-6 text-slate-600">/mes</span>
              </p>
              <Link
                href="/register"
                className={`mt-6 block rounded-md py-2 px-3 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-colors ${
                  plan.highlighted 
                    ? 'bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-600 shadow-sm' 
                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                }`}
              >
                {plan.cta}
              </Link>
              <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-slate-600">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-x-3">
                    <Check className="h-6 w-5 flex-none text-indigo-600" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
