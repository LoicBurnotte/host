import type { Link } from '@/models/Link.model'
import { pathFor } from '@/helpers/common.helper'
import { Link as RouterLink, useLocation } from 'react-router-dom'

export const Header = ({ links, basename }: { links: Link[]; basename?: string }) => {
  const { pathname } = useLocation()

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        width: '100%',
        padding: '20px 0',
        backgroundColor: 'lightgray',
      }}>
      <div style={{ display: 'flex', gap: '20px', flexDirection: 'row', justifyContent: 'space-around' }}>
        {links.map((link) => {
          const href = pathFor(basename, link.to)
          return (
            <RouterLink
              key={link.label}
              to={href}
              style={pathname === href ? { textDecoration: 'underline' } : undefined}>
              {link.label}
            </RouterLink>
          )
        })}
      </div>
    </div>
  )
}
