import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonSegment, IonSegmentButton, IonLabel, IonGrid, IonRow, IonCol, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonIcon, IonBadge, IonSearchbar, IonFab, IonFabButton, IonSpinner, IonText, IonToast, IonChip, IonRefresher, IonRefresherContent, IonButtons, IonBackButton, IonMenuButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  add, cart, search, flame, apps, flask, construct,
  hardwareChip, searchOutline, refresh, closeCircle,
  warning, eye, scale, heart, heartOutline,
  checkmarkCircle, time, navigate
} from 'ionicons/icons';
import { ProductoService } from '../../../core/services/producto-service';
import { CarritoService } from '../../../core/services/carrito-service';
import { ToastService } from '../../../core/services/toast-service';
import { Producto, TipoProducto } from '../../../core/models/producto.model';
import { FormsModule } from '@angular/forms';

interface FiltroRapido {
  id: string;
  nombre: string;
  icono: string;
}

@Component({
  selector: 'app-productos',
  templateUrl: './productos.page.html',
  styleUrls: ['./productos.page.scss'],
  standalone: true,
  imports: [ 
    IonButtons,
    IonRefresherContent,
    IonRefresher,
    IonChip,
    IonToast,
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonCard,
    IonCardContent,
    IonButton,
    IonIcon,
    IonBadge,
    IonSearchbar,
    IonFab,
    IonFabButton,
    IonSpinner,
    FormsModule,
    IonMenuButton
]
})
export class ProductosPage implements OnInit {
  private productoService = inject(ProductoService);
  private carritoService = inject(CarritoService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  // Signals y propiedades principales
  productos = signal<Producto[]>([]);
  productosFiltrados = signal<Producto[]>([]);
  cargando = signal(true);
  tipoSeleccionado = 'TODOS';
  busqueda = '';

  // Propiedades para el toast
  mostrarToast = false;
  mensajeToast = '';

  // Favoritos (simulado - en una app real usarías un servicio)
  productosFavoritos = signal<Set<number>>(new Set());

  // Filtros rápidos simplificados
  filtrosRapidos: FiltroRapido[] = [
    { id: 'stock-alto', nombre: 'Stock Alto', icono: 'checkmark-circle' },
    { id: 'stock-bajo', nombre: 'Stock Bajo', icono: 'warning' },
    { id: 'sin-stock', nombre: 'Sin Stock', icono: 'close-circle' }
  ];

  filtroActivo: string | null = null;

  cantidadCarrito = this.carritoService.cantidadTotal;

  constructor() {
    addIcons({
      flame, cart, apps, flask, construct, hardwareChip,
      searchOutline, refresh, closeCircle, warning,
      eye, scale, add, search, heart, heartOutline,
      checkmarkCircle, time, navigate
    });
  }

  ngOnInit() {
    this.cargarProductos();
  }

  cargarProductos() {
    this.cargando.set(true);
    this.productoService.obtenerTodos().subscribe({
      next: (productos) => {
        // Aseguramos que los productos tengan ID
        const productosConId = productos.filter(p => p.id !== undefined);
        this.productos.set(productosConId);
        this.productosFiltrados.set(productosConId);
        this.cargando.set(false);
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
        this.mostrarMensaje('Error al cargar productos');
        this.cargando.set(false);
      }
    });
  }

  // Métodos de filtrado y búsqueda
  filtrarPorTipo() {
    let productosFiltrados = this.productos();

    if (this.tipoSeleccionado !== 'TODOS') {
      productosFiltrados = productosFiltrados.filter(
        p => p.tipo === this.tipoSeleccionado
      );
    }

    this.productosFiltrados.set(productosFiltrados);
  }

  buscarProductos(event: any) {
    const texto = event.target.value?.toLowerCase() || '';

    if (!texto.trim()) {
      this.filtrarPorTipo();
      return;
    }

    const filtrados = this.productos().filter(p =>
      p.nombre.toLowerCase().includes(texto) ||
      p.descripcion?.toLowerCase().includes(texto)
    );
    this.productosFiltrados.set(filtrados);
  }

  // Métodos nuevos para el rediseño
  verCarrito() {
    this.irAlCarrito();
  }

  async refrescarProductos(event: any) {
    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simular delay
      this.cargarProductos();
      this.mostrarMensaje('Productos actualizados');
    } finally {
      event.target.complete();
    }
  }

  aplicarFiltroRapido(filtroId: string) {
    if (this.filtroActivo === filtroId) {
      // Si ya está activo, lo desactivamos
      this.filtroActivo = null;
      this.filtrarPorTipo();
      return;
    }

    this.filtroActivo = filtroId;
    let productosFiltrados = this.productos();

    switch (filtroId) {
      case 'stock-alto':
        productosFiltrados = productosFiltrados.filter(p =>
          p.stock !== undefined && p.stock > 10
        );
        break;
      case 'stock-bajo':
        productosFiltrados = productosFiltrados.filter(p =>
          p.stock !== undefined && p.stock <= 10 && p.stock > 0
        );
        break;
      case 'sin-stock':
        productosFiltrados = productosFiltrados.filter(p =>
          p.stock === 0
        );
        break;
    }

    this.productosFiltrados.set(productosFiltrados);
  }

  obtenerMensajeVacio(): string {
    if (this.busqueda) {
      return `No se encontraron productos para "${this.busqueda}"`;
    }
    if (this.tipoSeleccionado !== 'TODOS') {
      return `No hay productos del tipo ${this.getTipoNombre(this.tipoSeleccionado)}`;
    }
    if (this.filtroActivo) {
      const filtro = this.filtrosRapidos.find(f => f.id === this.filtroActivo);
      return `No hay productos que coincidan con el filtro "${filtro?.nombre}"`;
    }
    return 'No hay productos disponibles en este momento';
  }

  reiniciarFiltros() {
    this.tipoSeleccionado = 'TODOS';
    this.busqueda = '';
    this.filtroActivo = null;
    this.productosFiltrados.set(this.productos());
    this.mostrarMensaje('Filtros reiniciados');
  }

  // Métodos de navegación y acciones
  verDetalleProducto(producto: Producto) {
    // Verificamos que el producto tenga ID
    if (!producto.id) {
      this.mostrarMensaje('Error: Producto sin ID');
      return;
    }

    this.mostrarMensaje(`Vista previa de ${producto.nombre}`);
    console.log('Ver detalle del producto:', producto);
  }

  toggleFavorito(producto: Producto) {
    // Verificamos que el producto tenga ID
    if (!producto.id) {
      this.mostrarMensaje('Error: No se puede agregar a favoritos un producto sin ID');
      return;
    }

    const favoritos = new Set(this.productosFavoritos());

    if (favoritos.has(producto.id)) {
      favoritos.delete(producto.id);
      this.mostrarMensaje(`${producto.nombre} removido de favoritos`);
    } else {
      favoritos.add(producto.id);
      this.mostrarMensaje(`${producto.nombre} agregado a favoritos`);
    }

    this.productosFavoritos.set(favoritos);
  }

  esFavorito(productoId: number | undefined): boolean {
    // Si no hay ID, no es favorito
    if (!productoId) return false;
    return this.productosFavoritos().has(productoId);
  }

  // Métodos de utilidad
  getTipoIcon(tipo: string): string {
    const iconos: { [key: string]: string } = {
      'PIPETA': 'flask',
      'ACCESORIO': 'construct',
      'REPUESTO': 'hardware-chip',
      'TODOS': 'apps'
    };
    return iconos[tipo] || 'cube';
  }

  getTipoNombre(tipo: string): string {
    const nombres: { [key: string]: string } = {
      'PIPETA': 'Pipeta',
      'ACCESORIO': 'Accesorio',
      'REPUESTO': 'Repuesto',
      'TODOS': 'Todos'
    };
    return nombres[tipo] || tipo;
  }

  // Métodos existentes
  agregarAlCarrito(producto: Producto) {
    this.carritoService.agregarProducto(producto, 1);
    this.mostrarMensaje(`${producto.nombre} agregado al carrito`);
  }

  irAlCarrito() {
    this.router.navigate(['/carrito']);
  }

  formatearPrecio(precio: number): string {
    return precio.toLocaleString('es-CO');
  }

  // Sistema de mensajes local
  private mostrarMensaje(mensaje: string) {
    this.mensajeToast = mensaje;
    this.mostrarToast = true;
  }
}
