import { RouterProvider } from 'react-router'
import { Toaster } from './components/ui/sonner'
import { router } from './routes'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import { NotificationProvider } from './contexts/NotificationContext'

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <NotificationProvider>
          <RouterProvider router={router} />
          <Toaster />
        </NotificationProvider>
      </CartProvider>
    </AuthProvider>
  )
}
