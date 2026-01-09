import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonIcon, IonSpinner, IonSearchbar, IonChip, IonLabel, IonGrid, IonRow, IonCol, AlertController, IonRefresher, IonRefresherContent, ModalController, IonFab, IonFabButton, IonBadge, IonButtons, IonMenuButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, create, trash, refresh, search, cube, addCircle, searchOutline, closeCircle, warning, checkmarkCircle, scale, arrowBack } from 'ionicons/icons';
import { AdminModalStockPage } from '../admin-modal-stock/admin-modal-stock.page';
import { ProductoService } from '../../../core/services/producto-service';
import { ToastService } from '../../../core/services/toast-service';
import { Producto } from '../../../core/models/producto.model';
@Component({
  selector: 'app-admin-lista-productos',
  templateUrl: './admin-lista-productos.page.html',
  styleUrls: ['./admin-lista-productos.page.scss'],
  standalone: true,
  imports: [IonButtons, IonBadge, IonFabButton, IonFab, CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonCard, 
    IonCardContent,
    IonIcon,
    IonSpinner,
    IonSearchbar,
    IonRefresher,
    IonRefresherContent, IonMenuButton]
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
    addIcons({arrowBack,cube,addCircle,searchOutline,closeCircle,warning,checkmarkCircle,scale,create,trash,add,refresh,search});
  }

  ngOnInit() {
    this.cargarProductos();
  }

  volver() {
    this.router.navigate(['/admin-dashboard']);
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
  // Métodos para tipos de productos
getTipoClass(tipo: string): string {
  const tipoLower = tipo?.toLowerCase() || '';
  if (tipoLower.includes('pipeta')) return 'pipeta';
  if (tipoLower.includes('accesorio')) return 'accesorio';
  if (tipoLower.includes('repuesto')) return 'repuesto';
  return 'default';
}

getTipoIcon(tipo: string): string {
  const tipoLower = tipo?.toLowerCase() || '';
  if (tipoLower.includes('pipeta')) return 'flask';
  if (tipoLower.includes('accesorio')) return 'construct';
  if (tipoLower.includes('repuesto')) return 'hardware-chip';
  return 'cube';
}

getTipoNombre(tipo: string): string {
  const tipoLower = tipo?.toLowerCase() || '';
  if (tipoLower.includes('pipeta')) return 'Pipeta';
  if (tipoLower.includes('accesorio')) return 'Accesorio';
  if (tipoLower.includes('repuesto')) return 'Repuesto';
  return tipo || 'Producto';
}

formatearPrecio(precio: number): string {
  return precio.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

getColorStock(stock?: number): string {
  if (!stock && stock !== 0) return 'medium';
  if (stock === 0) return 'danger';
  if (stock <= 10) return 'warning';
  return 'success';
}
}
