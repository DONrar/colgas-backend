import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
  IonSpinner,
  IonSearchbar,
  IonChip,
  IonLabel,
  IonGrid,
  IonRow,
  IonCol,
  AlertController,
  IonRefresher,
  IonRefresherContent,
  ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, create, trash, refresh, search, cube } from 'ionicons/icons';
import { AdminModalStockPage } from '../admin-modal-stock/admin-modal-stock.page';
import { ProductoService } from '../../../core/services/producto-service';
import { ToastService } from '../../../core/services/toast-service';
import { Producto } from '../../../core/models/producto.model';
@Component({
  selector: 'app-admin-lista-productos',
  templateUrl: './admin-lista-productos.page.html',
  styleUrls: ['./admin-lista-productos.page.scss'],
  standalone: true,
  imports: [CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonIcon,
    IonSpinner,
    IonSearchbar,
    IonChip,
    IonLabel,
    IonGrid,
    IonRow,
    IonCol,
    IonRefresher,
    IonRefresherContent]
})
export class AdminListaProductosPage implements OnInit {
 private productoService = inject(ProductoService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private alertController = inject(AlertController);
  private modalController = inject(ModalController);

  productos = signal<Producto[]>([]);
  productosFiltrados = signal<Producto[]>([]);
  cargando = signal(true);
  textoBusqueda = signal('');

  constructor() {
    addIcons({ add, create, trash, refresh, search, cube });
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
        this.toastService.error('Error al cargar los productos');
        this.cargando.set(false);
      }
    });
  }

  handleRefresh(event: any) {
    this.productoService.obtenerTodos().subscribe({
      next: (productos) => {
        this.productos.set(productos);
        this.filtrarProductos();
        event.target.complete();
        this.toastService.success('Lista actualizada');
      },
      error: (error) => {
        console.error('Error al refrescar:', error);
        event.target.complete();
        this.toastService.error('Error al actualizar');
      }
    });
  }

  buscarProductos(event: any) {
    const texto = event.target.value?.toLowerCase() || '';
    this.textoBusqueda.set(texto);
    this.filtrarProductos();
  }

  filtrarProductos() {
    const texto = this.textoBusqueda();
    if (!texto) {
      this.productosFiltrados.set(this.productos());
      return;
    }

    const filtrados = this.productos().filter(p =>
      p.nombre.toLowerCase().includes(texto) ||
      p.tipo.toLowerCase().includes(texto)
    );
    this.productosFiltrados.set(filtrados);
  }

  irACrear() {
    this.router.navigate(['/admin/productos/crear']);
  }

  irAEditar(id: number) {
    this.router.navigate(['/admin/productos/editar', id]);
  }

  async confirmarEliminar(producto: Producto) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Estás seguro de que deseas eliminar "${producto.nombre}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.eliminarProducto(producto.id!);
          }
        }
      ]
    });

    await alert.present();
  }

  eliminarProducto(id: number) {
    this.productoService.eliminar(id).subscribe({
      next: () => {
        this.toastService.success('Producto eliminado exitosamente');
        this.cargarProductos();
      },
      error: (error) => {
        console.error('Error al eliminar:', error);
        this.toastService.error('Error al eliminar el producto');
      }
    });
  }

  getColorStock(stock: number | undefined): string {
    if (!stock || stock === 0) return 'danger';
    if (stock <= 10) return 'warning';
    return 'success';
  }

  async abrirModalStock(producto: Producto) {
    const modal = await this.modalController.create({
      component: AdminModalStockPage,
      componentProps: {
        producto: producto
      }
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'actualizado') {
      this.cargarProductos();
    }
  }
}
