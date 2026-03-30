import { redirect } from '@/i18n/routing'

export default async function NewEmployeeRedirect({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  redirect({ href: '/dashboard/team/new', locale })
}
