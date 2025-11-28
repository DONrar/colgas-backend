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
        loadComponent: () => import('./pages/productos/productos.page').then(m => m.ProductosPage)
      },
      {
        path: 'expresos',
        loadComponent: () => import('./pages/start-trip-page/start-trip-page.page').then(m => m.StartTripPagePage)
      },
      {
        path: 'historial',
        loadComponent: () => import('./pages/historial/historial.page').then(m => m.HistorialPage)
      },
      {
        path: 'contacto',
        loadComponent: () => import('./pages/contacto/contacto.page').then(m => m.ContactoPage)
      }, 
    ]
  },
  {
    path: 'carrito',
    loadComponent: () => import('./pages/carrito/carrito.page').then(m => m.CarritoPage)
  },
  {
    path: 'checkout',
    loadComponent: () => import('./pages/checkout/checkout.page').then(m => m.CheckoutPage)
  },
  {
    path: 'pedido-confirmado/:id',
    loadComponent: () => import('./pages/pedido-confirmado/pedido-confirmado.page').then(m => m.PedidoConfirmadoPage)
  },
  {
    path: 'expreso-confirmado/:id',
    loadComponent: () => import('./pages/expreso-confirmado/expreso-confirmado.page').then(m => m.ExpresoConfirmadoPage)
  },
  {
    path: 'tabs',
    loadComponent: () => import('./pages/tabs/tabs.page').then(m => m.TabsPage)
  },
  {
    path: 'productos',
    loadComponent: () => import('./pages/productos/productos.page').then(m => m.ProductosPage)
  },
  {
    path: 'carrito',
    loadComponent: () => import('./pages/carrito/carrito.page').then(m => m.CarritoPage)
  },
  {
    path: 'checkout',
    loadComponent: () => import('./pages/checkout/checkout.page').then(m => m.CheckoutPage)
  },
  {
    path: 'pedido-confirmado',
    loadComponent: () => import('./pages/pedido-confirmado/pedido-confirmado.page').then(m => m.PedidoConfirmadoPage)
  },
  {
    path: 'expresos',
    loadComponent: () => import('./pages/expresos/expresos.page').then(m => m.ExpresosPage)
  },
  {
    path: 'expreso-confirmado',
    loadComponent: () => import('./pages/expreso-confirmado/expreso-confirmado.page').then(m => m.ExpresoConfirmadoPage)
  },
  {
    path: 'historial',
    loadComponent: () => import('./pages/historial/historial.page').then(m => m.HistorialPage)
  },
  {
    path: 'contacto',
    loadComponent: () => import('./pages/contacto/contacto.page').then(m => m.ContactoPage)
  },
  {
    path: 'mapa-selector',
    loadComponent: () => import('./pages/mapa-selector/mapa-selector.page').then(m => m.MapaSelectorPage)
  },
  {
    path: 'admin-productos-page',
    loadComponent: () => import('./pages/admin-productos-page/admin-productos-page.page').then( m => m.AdminProductosPagePage)
  },
  {
    path: 'start-trip-page',
    loadComponent: () => import('./pages/start-trip-page/start-trip-page.page').then( m => m.StartTripPagePage)
  },
  {
    path: 'select-destination-page',
    loadComponent: () => import('./pages/select-destination-page/select-destination-page.page').then( m => m.SelectDestinationPagePage)
  },
  {
    path: 'trip-summary-page',
    loadComponent: () => import('./pages/trip-summary-page/trip-summary-page.page').then( m => m.TripSummaryPagePage)
  },
  {
    path: 'expreso-detalle/:id',
    loadComponent: () => import('./pages/expreso-detalle/expreso-detalle.page').then( m => m.ExpresoDetallePage)
  },
  {
    path: 'pedido-detalle/:id',
    loadComponent: () => import('./pages/pedido-detalle/pedido-detalle.page').then( m => m.PedidoDetallePage)
  },
];
