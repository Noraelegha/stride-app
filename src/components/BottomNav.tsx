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
    <>
      <div style={{
        height: 'calc(48px + max(env(safe-area-inset-bottom), 8px))',
        flexShrink: 0,
      }} />

      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '430px',
        background: '#ffffff',
        borderTop: '0.5px solid #e8e8e8',
        boxShadow: '0 -1px 0 rgba(0,0,0,0.06)',
        display: 'flex',
        alignItems: 'flex-start',
        paddingTop: '8px',
        paddingBottom: 'max(env(safe-area-inset-bottom), 8px)',
        paddingLeft: '6px',
        paddingRight: '6px',
        zIndex: 1000,
        boxSizing: 'border-box' as const,
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
                gap: '3px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0 4px 6px',
                color: active ? '#1a1a2e' : '#cccccc',
                transition: 'color 0.2s',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <Icon
                size={22}
                strokeWidth={active ? 2.5 : 1.8}
                color={active ? '#1a1a2e' : '#cccccc'}
              />
              <span style={{
                fontSize: '9px',
                fontWeight: active ? 700 : 400,
                lineHeight: 1,
              }}>
                {label}
              </span>
            </button>
          )
        })}
      </nav>
    </>
  )
}