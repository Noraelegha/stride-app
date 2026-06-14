export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
      <div style={{ minHeight: '100vh', width: '100%' }}>
        {children}
      </div>
    )
  }