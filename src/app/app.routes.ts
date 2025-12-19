import { Routes } from '@angular/router';

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
    path: 'expresos',
    loadComponent: () => import('./pages/viajes/expresos/expresos.page').then(m => m.ExpresosPage)
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
    path: 'mapa-selector',
    loadComponent: () => import('./pages/viajes/mapa-selector/mapa-selector.page').then(m => m.MapaSelectorPage)
  },
  {
    path: 'start-trip-page',
    loadComponent: () => import('./pages/viajes/start-trip-page/start-trip-page.page').then( m => m.StartTripPagePage)
  },
  {
    path: 'select-destination-page',
    loadComponent: () => import('./pages/viajes/select-destination-page/select-destination-page.page').then( m => m.SelectDestinationPagePage)
  },
  {
    path: 'trip-summary-page',
    loadComponent: () => import('./pages/viajes/trip-summary-page/trip-summary-page.page').then( m => m.TripSummaryPagePage)
  },
  {
    path: 'expreso-detalle/:id',
    loadComponent: () => import('./pages/viajes/expreso-detalle/expreso-detalle.page').then( m => m.ExpresoDetallePage)
  },
  {
    path: 'pedido-detalle/:id',
    loadComponent: () => import('./pages/products/pedido-detalle/pedido-detalle.page').then( m => m.PedidoDetallePage)
  },
  {
    path: 'admin/productos/crear',
    loadComponent: () => import('./pages/admin/admin-productos-page/admin-productos-page.page').then( m => m.AdminProductosPagePage)
  },
  {
    path: 'admin/productos',
    loadComponent: () => import('./pages/admin/admin-lista-productos/admin-lista-productos.page').then( m => m.AdminListaProductosPage)
  },
  {
    path: 'admin-modal-stock',
    loadComponent: () => import('./pages/admin/admin-modal-stock/admin-modal-stock.page').then( m => m.AdminModalStockPage)
  },
  {
    path: 'admin/productos/editar/:id',
    loadComponent: () => import('./pages/admin/admin-editar-productos/admin-editar-productos.page').then( m => m.AdminEditarProductosPage)
  },
  {
    path: 'admin/pedidos',
    loadComponent: () => import('./pages/admin/admin-lista-pedidos/admin-lista-pedidos.page').then( m => m.AdminListaPedidosPage)
  },
  {
    path: 'admin/pedidos/detalle/:id',
    loadComponent: () => import('./pages/admin/admin-detalle-pedido/admin-detalle-pedido.page').then(m => m.AdminDetallePedidoPage)
  },
  {
    path: 'admin-dashboard',
    loadComponent: () => import('./pages/admin/admin-dashboard/admin-dashboard.page').then( m => m.AdminDashboardPage)
  },
];
