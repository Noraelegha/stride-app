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
      position: 'sticky', bottom: 0,
      background: '#ffffff',
      borderTop: '0.5px solid #e8e8e8',
      display: 'flex',
      padding: '0 6px 20px',
      zIndex: 100,
      flexShrink: 0,
    }}>
      {navItems.map(({ icon: Icon, label, path }) => {
        const active = pathname === path
        return (
          <button key={path} onClick={() => router.push(path)} style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: '2px', background: 'none',
            border: 'none', cursor: 'pointer', padding: '7px 4px 0',
            color: active ? '#1a1a2e' : '#cccccc', transition: 'color 0.2s',
          }}>
            <Icon size={22} strokeWidth={active ? 2.5 : 1.8} color={active ? '#1a1a2e' : '#cccccc'} />
            <span style={{ fontSize: '9px', fontWeight: active ? 600 : 400 }}>{label}</span>
          </button>
        )
      })}
    </nav>
  )
}