import { lazy } from 'react'
import { Homepage } from './pages/Homepage'
import type { Link } from './models/Link.model'

const ProjectA = lazy(() => import('projectA/App'))

export const headerLinks = [
  { label: 'Homepage', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
  { label: 'Services', to: '/services' },
  { label: 'Products', to: '/products' },
  { label: 'Blog', to: '/blog' },
]

export const routes: Link[] = [
  { label: 'Homepage', to: '/', children: <Homepage /> },
  { label: 'About', to: '/about/*', children: <ProjectA /> },
  { label: 'Contact', to: '/contact', children: <div>Contact</div> },
  { label: 'Services', to: '/services', children: <div>Services</div> },
  { label: 'Products', to: '/products', children: <div>Products</div> },
  { label: 'Blog', to: '/blog', children: <div>Blog</div> },
]
