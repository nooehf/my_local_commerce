'use client'

import dynamic from 'next/dynamic'
import { ComponentProps } from 'react'

// Import dynamically with ssr: false inside a Client Component
const BusinessMap = dynamic(
  () => import('@/components/BusinessMap'),
  { ssr: false }
)

export default function MapWrapper(props: ComponentProps<typeof BusinessMap>) {
  return <BusinessMap {...props} />
}
