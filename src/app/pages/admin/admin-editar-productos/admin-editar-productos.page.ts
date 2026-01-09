import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonItem,
  IonLabel,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
  IonSpinner,
  IonBackButton,
  IonButtons, IonCardSubtitle } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { image, save, trash, arrowBack, create, cube, pricetag, grid, scale, cash, server, documentText, cloudUpload, imageOutline, closeCircle, expand } from 'ionicons/icons';
import { ProductoService } from '../../../core/services/producto-service';
import { ToastService } from '../../../core/services/toast-service';
import { Producto, TipoProducto } from '../../../core/models/producto.model';
@Component({
  selector: 'app-admin-editar-productos',
  templateUrl: './admin-editar-productos.page.html',
  styleUrls: ['./admin-editar-productos.page.scss'],
  standalone: true,
  imports: [IonCardSubtitle, CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonInput,
    IonTextarea,
    IonSelect,
    IonSelectOption,
    IonItem,
    IonLabel,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonIcon,
    IonSpinner,
    IonBackButton,
    IonButtons,
  RouterLink]
})
export class AdminEditarProductosPage implements OnInit {
private productoService = inject(ProductoService);
  private toastService = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  productoId: number | null = null;
  producto: Partial<Producto> = {};
  imagenPreview = signal<string | null>(null);
  cargando = signal(true);
  guardando = signal(false);

  tipos = ['PIPETA', 'ACCESORIO', 'REPUESTO'];

  constructor() {
    addIcons({create, cube, pricetag, grid, scale, cash, server, documentText, image,
          cloudUpload, trash, imageOutline, save, closeCircle, arrowBack, expand});
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.productoId = parseInt(id);
      this.cargarProducto(this.productoId);
    }
  }

  cargarProducto(id: number) {
    this.cargando.set(true);
    this.productoService.obtenerPorId(id).subscribe({
      next: (producto) => {
        this.producto = producto;
        if (producto.imagen) {
          this.imagenPreview.set(producto.imagen);
        }
        this.cargando.set(false);
      },
      error: (error) => {
        console.error('Error al cargar producto:', error);
        this.toastService.error('Error al cargar el producto');
        this.cargando.set(false);
        this.router.navigate(['/admin/productos']);
      }
    });
  }

  async seleccionarImagen(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.toastService.error('Por favor selecciona una imagen válida');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.toastService.error('La imagen no debe superar 5MB');
      return;
    }

    try {
      const base64 = await this.productoService.convertirArchivoABase64(file);
      this.producto.imagen = base64;
      this.imagenPreview.set(base64);
      this.toastService.success('Imagen cargada correctamente');
    } catch (error) {
      console.error('Error al cargar imagen:', error);
      this.toastService.error('Error al cargar la imagen');
    }
  }

  eliminarImagen() {
    this.producto.imagen = undefined;
    this.imagenPreview.set(null);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (input) input.value = '';
  }

  validarFormulario(): boolean {
    if (!this.producto.nombre?.trim()) {
      this.toastService.error('El nombre es obligatorio');
      return false;
    }
    if (!this.producto.precio || this.producto.precio <= 0) {
      this.toastService.error('El precio debe ser mayor a 0');
      return false;
    }
    if (this.producto.stock === undefined || this.producto.stock < 0) {
      this.toastService.error('El stock no puede ser negativo');
      return false;
    }
    return true;
  }

  actualizarProducto() {
    if (!this.validarFormulario() || !this.productoId) return;

    this.guardando.set(true);

    const productoActualizado: Producto = {
      id: this.productoId,
      nombre: this.producto.nombre!,
      tipo: this.producto.tipo!,
      precio: this.producto.precio!,
      stock: this.producto.stock ?? 0,
      descripcion: this.producto.descripcion,
      peso: this.producto.peso,
      imagen: this.producto.imagen,
      activo: true
    };

    this.productoService.actualizar(this.productoId, productoActualizado).subscribe({
      next: () => {
        this.toastService.success('Producto actualizado exitosamente');
        this.guardando.set(false);
        this.router.navigate(['/admin/productos']);
      },
      error: (error) => {
        console.error('Error al actualizar producto:', error);
        this.toastService.error('Error al actualizar el producto');
        this.guardando.set(false);
      }
    });
  }

  getTipoIcon(tipo: string): string {
  switch (tipo) {
    case 'PIPETA':
      return 'flask';
    case 'ACCESORIO':
      return 'construct';
    case 'REPUESTO':
      return 'hardware-chip';
    default:
      return 'cube';
  }
}
ampliarImagen() {
  if (this.imagenPreview()) {
    // Implementa la lógica para ampliar la imagen
    // Puedes usar un modal o un componente de visualización de imágenes
    console.log('Ampliar imagen:', this.imagenPreview());
  }
}
}
