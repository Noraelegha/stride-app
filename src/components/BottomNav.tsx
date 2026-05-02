'use client'
import { useRouter, usePathname } from 'next/navigation'
import { Home, BookOpen, Users, Bell, User } from 'lucide-react'

const navItems = [
  { icon: Home,     label: 'Home',      path: '/home' },
  { icon: BookOpen, label: 'Journey',   path: '/journey' },
  { icon: Users,    label: 'Community', path: '/community' },
  { icon: Bell,     label: 'Alerts',    path: '/alerts' },
  { icon: User,     label: 'Profile',   path: '/profile' },
]

export default function BottomNav() {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <nav style={{
      position: 'sticky',
      bottom: 0,
      background: '#1a1a2e',
      borderTop: '1px solid rgba(255,255,255,0.1)',
      display: 'flex',
      padding: '8px 0 20px',
      zIndex: 100,
    }}>
      {navItems.map(({ icon: Icon, label, path }) => {
        const active = pathname === path
        return (
          <button
            key={path}
            onClick={() => router.push(path)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px 0',
              color: active ? '#F5A623' : '#94a3b8',
              transition: 'color 0.2s',
            }}
          >
            <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
            <span style={{ fontSize: '10px', fontWeight: active ? 700 : 400 }}>
              {label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}