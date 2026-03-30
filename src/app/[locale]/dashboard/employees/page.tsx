import { redirect } from '@/i18n/routing'

export default async function EmployeesRedirect({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  redirect({ href: '/dashboard/team', locale })
}
