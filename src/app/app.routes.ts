import { Routes } from '@angular/router';
import { authGuard } from './core/Auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'tabs',
    pathMatch: 'full'
  },
  {
    path: 'tabs',
    loadComponent: () => import('./pages/tabs/tabs.page').then(m => m.TabsPage),
    children: [
      {
        path: '',
        redirectTo: 'productos',
        pathMatch: 'full'
      },
      {
        path: 'productos',
        loadComponent: () => import('./pages/products/productos/productos.page').then(m => m.ProductosPage)
      },
      {
        path: 'expresos',
        loadComponent: () => import('./pages/viajes/start-trip-page/start-trip-page.page').then(m => m.StartTripPagePage)
      },
      {
        path: 'historial',
        loadComponent: () => import('./pages/utils/historial/historial.page').then(m => m.HistorialPage)
      },
      {
        path: 'contacto',
        loadComponent: () => import('./pages/utils/contacto/contacto.page').then(m => m.ContactoPage)
      },
    ]
  },
  {
    path: 'carrito',
    loadComponent: () => import('./pages/products/carrito/carrito.page').then(m => m.CarritoPage)
  },
  {
    path: 'checkout',
    loadComponent: () => import('./pages/utils/checkout/checkout.page').then(m => m.CheckoutPage)
  },
  {
    path: 'pedido-confirmado/:id',
    loadComponent: () => import('./pages/products/pedido-confirmado/pedido-confirmado.page').then(m => m.PedidoConfirmadoPage)
  },
  {
    path: 'expreso-confirmado/:id',
    loadComponent: () => import('./pages/viajes/expreso-confirmado/expreso-confirmado.page').then(m => m.ExpresoConfirmadoPage)
  },
  {
    path: 'tabs',
    loadComponent: () => import('./pages/tabs/tabs.page').then(m => m.TabsPage)
  },
  {
    path: 'productos',
    loadComponent: () => import('./pages/products/productos/productos.page').then(m => m.ProductosPage)
  },
  {
    path: 'carrito',
    loadComponent: () => import('./pages/products/carrito/carrito.page').then(m => m.CarritoPage)
  },
  {
    path: 'checkout',
    loadComponent: () => import('./pages/utils/checkout/checkout.page').then(m => m.CheckoutPage)
  },
  {
    path: 'pedido-confirmado',
    loadComponent: () => import('./pages/products/pedido-confirmado/pedido-confirmado.page').then(m => m.PedidoConfirmadoPage)
  },
  {
    path: 'expreso-confirmado',
    loadComponent: () => import('./pages/viajes/expreso-confirmado/expreso-confirmado.page').then(m => m.ExpresoConfirmadoPage)
  },
  {
    path: 'historial',
    loadComponent: () => import('./pages/utils/historial/historial.page').then(m => m.HistorialPage)
  },
  {
    path: 'contacto',
    loadComponent: () => import('./pages/utils/contacto/contacto.page').then(m => m.ContactoPage)
  },
  {
    path: 'start-trip-page',
    loadComponent: () => import('./pages/viajes/start-trip-page/start-trip-page.page').then(m => m.StartTripPagePage)
  },
  {
    path: 'select-destination-page',
    loadComponent: () => import('./pages/viajes/select-destination-page/select-destination-page.page').then(m => m.SelectDestinationPagePage)
  },
  {
    path: 'trip-summary-page',
    loadComponent: () => import('./pages/viajes/trip-summary-page/trip-summary-page.page').then(m => m.TripSummaryPagePage)
  },
  {
    path: 'expreso-detalle/:id',
    loadComponent: () => import('./pages/viajes/expreso-detalle/expreso-detalle.page').then(m => m.ExpresoDetallePage)
  },
  {
    path: 'pedido-detalle/:id',
    loadComponent: () => import('./pages/products/pedido-detalle/pedido-detalle.page').then(m => m.PedidoDetallePage)
  },
  {
    path: 'admin-login',
    loadComponent: () => import('./pages/admin/admin-login/admin-login.page').then(m => m.AdminLoginPage)
  },
  {
    path: 'logout-button',
    loadComponent: () => import('./pages/admin/logout-button/logout-button.page').then(m => m.LogoutButtonComponent)
  },
  // ========== RUTAS ADMIN (PROTEGIDAS) ==========
  {
    path: 'admin-dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/admin/admin-dashboard/admin-dashboard.page').then(m => m.AdminDashboardPage)
  },
  {
    path: 'admin/productos',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/admin/admin-lista-productos/admin-lista-productos.page').then(m => m.AdminListaProductosPage)
  },
  {
    path: 'admin/productos/crear',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/admin/admin-productos-page/admin-productos-page.page').then(m => m.AdminProductosPagePage)
  },
  {
    path: 'admin/productos/editar/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/admin/admin-editar-productos/admin-editar-productos.page').then(m => m.AdminEditarProductosPage)
  },
  {
    path: 'admin-modal-stock',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/admin/admin-modal-stock/admin-modal-stock.page').then(m => m.AdminModalStockPage)
  },
  {
    path: 'admin/pedidos',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/admin/admin-lista-pedidos/admin-lista-pedidos.page').then(m => m.AdminListaPedidosPage)
  },
  {
    path: 'admin/pedidos/detalle/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/admin/admin-detalle-pedido/admin-detalle-pedido.page').then(m => m.AdminDetallePedidoPage)
  },
  {
    path: 'admin-lista-expreso',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/admin/admin-lista-expreso/admin-lista-expreso.page').then(m => m.AdminListaExpresoPage)
  },
  {
    path: 'admin/expresos/detalle/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/admin/admin-detalle-expreso/admin-detalle-expreso.page').then(m => m.AdminDetalleExpresoPage)
  },
  {
    path: 'configuracion-admin',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/admin/configuracion-admin/configuracion-admin.page').then(m => m.ConfiguracionAdminPage)
  },

];
