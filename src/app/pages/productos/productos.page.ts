import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonBadge,
  IonSearchbar,
  IonFab,
  IonFabButton,
  IonSpinner,
  IonText
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, cart, search, flame } from 'ionicons/icons';
import { ProductoService } from '../../core/services/producto-service';
import { CarritoService } from '../../core/services/carrito-service';
import { ToastService } from '../../core/services/toast-service';
import { Producto, TipoProducto } from '../../core/models/producto.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.page.html',
  styleUrls: ['./productos.page.scss'],
  standalone: true,
  imports: [ CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButton,
    IonIcon,
    IonBadge,
    IonSearchbar,
    IonFab,
    IonFabButton,
    IonSpinner,
    IonText,
  CommonModule, FormsModule]
})
export class ProductosPage implements OnInit {
private productoService = inject(ProductoService);
  private carritoService = inject(CarritoService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  productos = signal<Producto[]>([]);
  productosFiltrados = signal<Producto[]>([]);
  cargando = signal(true);
  tipoSeleccionado = 'TODOS';
  busqueda = '';

  cantidadCarrito = this.carritoService.cantidadTotal;

  constructor() {
    addIcons({ add, cart, search });
  }

  ngOnInit() {
    this.cargarProductos();
  }

  cargarProductos() {
    this.cargando.set(true);
    this.productoService.obtenerTodos().subscribe({
      next: (productos) => {
        this.productos.set(productos);
        this.productosFiltrados.set(productos);
        this.cargando.set(false);
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
        this.toastService.error('Error al cargar productos');
        this.cargando.set(false);
      }
    });
  }

  filtrarPorTipo() {
    if (this.tipoSeleccionado === 'TODOS') {
      this.productosFiltrados.set(this.productos());
    } else {
      const filtrados = this.productos().filter(
        p => p.tipo === this.tipoSeleccionado
      );
      this.productosFiltrados.set(filtrados);
    }
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

  agregarAlCarrito(producto: Producto) {
    this.carritoService.agregarProducto(producto, 1);
    this.toastService.success(`${producto.nombre} agregado al carrito`);
  }

  irAlCarrito() {
    this.router.navigate(['/carrito']);
  }

  formatearPrecio(precio: number): string {
    return precio.toLocaleString('es-CO');
  }

}
