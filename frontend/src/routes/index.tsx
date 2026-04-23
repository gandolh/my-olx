import { Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { ComingSoon } from '@/components/ui/ComingSoon'
import { HomePage } from '@/modules/home/pages/HomePage'
import { CardSkeleton } from '@/components/ui/Skeleton'

function PageLoader() {
  return (
    <main className="pt-24 flex-1">
      <div className="max-w-screen-2xl mx-auto px-8 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
      </div>
    </main>
  )
}

export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="*" element={<ComingSoon />} />
      </Routes>
    </Suspense>
  )
}
