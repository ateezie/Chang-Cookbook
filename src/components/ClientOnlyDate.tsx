'use client'

import { useEffect, useState } from 'react'

interface ClientOnlyDateProps {
  dateString: string
  className?: string
}

export default function ClientOnlyDate({ dateString, className = '' }: ClientOnlyDateProps) {
  const [formattedDate, setFormattedDate] = useState<string>('')
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const date = new Date(dateString)
    setFormattedDate(date.toLocaleDateString())
  }, [dateString])

  // Return nothing during SSR to avoid hydration mismatch
  if (!isMounted) {
    return <span className={className}>Loading...</span>
  }

  return <span className={className}>{formattedDate}</span>
}