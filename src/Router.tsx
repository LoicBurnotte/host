import { Suspense } from 'react'
import { routes } from './routes'
import { Routes, Route } from 'react-router-dom'

export const Router = () => {
  return (
    <Suspense fallback="Loading...">
      <Routes>
        {routes.map((link) => (
          <Route key={link.label} path={link.to} element={link.children} />
        ))}
      </Routes>
    </Suspense>
  )
}
