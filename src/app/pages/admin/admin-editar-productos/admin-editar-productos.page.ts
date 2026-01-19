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
  IonButtons,
  IonCardSubtitle
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  image,
  save,
  trash,
  arrowBack,
  create,
  cube,
  pricetag,
  grid,
  scale,
  cash,
  server,
  documentText,
  cloudUpload,
  imageOutline,
  closeCircle,
  expand
} from 'ionicons/icons';
import { ProductoService } from '../../../core/services/producto-service';
import { ToastService } from '../../../core/services/toast-service';
import { Producto, TipoProducto } from '../../../core/models/producto.model';

@Component({
  selector: 'app-admin-editar-productos',
  templateUrl: './admin-editar-productos.page.html',
  styleUrls: ['./admin-editar-productos.page.scss'],
  standalone: true,
  imports: [
    IonCardSubtitle,
    CommonModule,
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
    RouterLink
  ]
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
    addIcons({
      create,
      cube,
      pricetag,
      grid,
      scale,
      cash,
      server,
      documentText,
      image,
      cloudUpload,
      trash,
      imageOutline,
      save,
      closeCircle,
      arrowBack,
      expand
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.productoId = parseInt(id, 10);
      this.cargarProducto(this.productoId);
    }
  }

  cargarProducto(id: number) {
    this.cargando.set(true);
    this.productoService.obtenerPorId(id).subscribe({
      next: (producto) => {
        this.producto = { ...producto };
        // Asegurar que el precio sea un entero al cargar
        if (this.producto.precio !== undefined && this.producto.precio !== null) {
          this.producto.precio = this.convertirAEntero(this.producto.precio);
        }
        // Asegurar que el stock sea un entero al cargar
        if (this.producto.stock !== undefined && this.producto.stock !== null) {
          this.producto.stock = this.convertirAEntero(this.producto.stock);
        }
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

  /**
   * Convierte cualquier valor a un entero de forma segura
   * Evita problemas de punto flotante de JavaScript
   */
  private convertirAEntero(valor: any): number {
    if (valor === undefined || valor === null || valor === '') {
      return 0;
    }
    // Convertir a string, eliminar caracteres no numéricos (excepto signo negativo al inicio)
    const valorString = String(valor).replace(/[^0-9-]/g, '').replace(/(?!^)-/g, '');
    const resultado = parseInt(valorString, 10);
    return isNaN(resultado) ? 0 : resultado;
  }

  /**
   * Normaliza el precio cuando el input pierde el foco
   * Asegura que siempre sea un entero válido
   */
  normalizarPrecio() {
    if (this.producto.precio !== undefined) {
      this.producto.precio = this.convertirAEntero(this.producto.precio);
    }
  }

  /**
   * Normaliza el stock cuando el input pierde el foco
   * Asegura que siempre sea un entero válido y no negativo
   */
  normalizarStock() {
    if (this.producto.stock !== undefined) {
      const stockEntero = this.convertirAEntero(this.producto.stock);
      this.producto.stock = Math.max(0, stockEntero); // No permitir valores negativos
    }
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

    const precioValidado = this.convertirAEntero(this.producto.precio);
    if (precioValidado <= 0) {
      this.toastService.error('El precio debe ser mayor a 0');
      return false;
    }

    const stockValidado = this.convertirAEntero(this.producto.stock);
    if (stockValidado < 0) {
      this.toastService.error('El stock no puede ser negativo');
      return false;
    }

    return true;
  }

  actualizarProducto() {
    if (!this.validarFormulario() || !this.productoId) return;

    this.guardando.set(true);

    // Conversión robusta a enteros - evita problemas de punto flotante
    const precioEntero = this.convertirAEntero(this.producto.precio);
    const stockEntero = this.convertirAEntero(this.producto.stock);

    const productoActualizado: Producto = {
      id: this.productoId,
      nombre: this.producto.nombre!.trim(),
      tipo: this.producto.tipo!,
      precio: precioEntero,
      stock: stockEntero,
      descripcion: this.producto.descripcion?.trim(),
      peso: this.producto.peso?.trim(),
      imagen: this.producto.imagen,
      activo: true
    };

    console.log('Enviando producto con precio:', precioEntero, 'y stock:', stockEntero);

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
