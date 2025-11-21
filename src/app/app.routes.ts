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
        loadComponent: () => import('./pages/expresos/expresos.page').then(m => m.ExpresosPage)
      },
      {
        path: 'historial',
        loadComponent: () => import('./pages/historial/historial.page').then(m => m.HistorialPage)
      },
      {
        path: 'contacto',
        loadComponent: () => import('./pages/contacto/contacto.page').then(m => m.ContactoPage)
      }
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
    loadComponent: () => import('./pages/tabs/tabs.page').then( m => m.TabsPage)
  },
  {
    path: 'productos',
    loadComponent: () => import('./pages/productos/productos.page').then( m => m.ProductosPage)
  },
  {
    path: 'carrito',
    loadComponent: () => import('./pages/carrito/carrito.page').then( m => m.CarritoPage)
  },
  {
    path: 'checkout',
    loadComponent: () => import('./pages/checkout/checkout.page').then( m => m.CheckoutPage)
  },
  {
    path: 'pedido-confirmado',
    loadComponent: () => import('./pages/pedido-confirmado/pedido-confirmado.page').then( m => m.PedidoConfirmadoPage)
  },
  {
    path: 'expresos',
    loadComponent: () => import('./pages/expresos/expresos.page').then( m => m.ExpresosPage)
  },
  {
    path: 'expreso-confirmado',
    loadComponent: () => import('./pages/expreso-confirmado/expreso-confirmado.page').then( m => m.ExpresoConfirmadoPage)
  },
  {
    path: 'historial',
    loadComponent: () => import('./pages/historial/historial.page').then( m => m.HistorialPage)
  },
  {
    path: 'contacto',
    loadComponent: () => import('./pages/contacto/contacto.page').then( m => m.ContactoPage)
  }
];
