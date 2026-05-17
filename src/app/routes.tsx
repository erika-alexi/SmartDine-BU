import { createBrowserRouter } from 'react-router';
import { RootLayout } from './components/RootLayout';
import { HomePage } from './pages/HomePage';
import { MenuPage } from './pages/MenuPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { PaymentPage } from './pages/PaymentPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { OrderStatusPage } from './pages/OrderStatusPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { OrderManagementPage } from './pages/OrderManagementPage';
import { MenuManagementPage } from './pages/MenuManagementPage';
import { MyOrdersPage } from './pages/MyOrdersPage';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      { index: true, Component: HomePage },
      { path: 'menu', Component: MenuPage },
      { path: 'cart', Component: CartPage },
      { path: 'checkout', Component: CheckoutPage },
      { path: 'payment', Component: PaymentPage },
      { path: 'order-confirmation', Component: OrderConfirmationPage },
      { path: 'order-status/:orderId', Component: OrderStatusPage },
      { path: 'my-orders', Component: MyOrdersPage },
      { path: 'login', Component: LoginPage },
      { path: 'register', Component: RegisterPage },
      { path: 'admin/login', Component: AdminLoginPage },
      { path: 'admin/dashboard', Component: AdminDashboardPage },
      { path: 'admin/orders', Component: OrderManagementPage },
      { path: 'admin/menu', Component: MenuManagementPage }
    ]
  }
]);
