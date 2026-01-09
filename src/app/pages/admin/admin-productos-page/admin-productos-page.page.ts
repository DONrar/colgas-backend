import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  IonSpinner, IonBackButton, IonButtons } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { image, save, trash, cube, addCircle, pricetag, grid, scale, cash, documentText } from 'ionicons/icons';
import { ProductoService } from '../../../core/services/producto-service';
import { ToastService } from '../../../core/services/toast-service';
import { Producto, TipoProducto } from '../../../core/models/producto.model';

@Component({
  selector: 'app-admin-productos-page',
  templateUrl: './admin-productos-page.page.html',
  styleUrls: ['./admin-productos-page.page.scss'],
  standalone: true,
  imports: [IonButtons, IonBackButton, CommonModule,
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
    IonSpinner]
})
export class AdminProductosPagePage implements OnInit {
  private productoService = inject(ProductoService);
  private toastService = inject(ToastService);

  producto: Partial<Producto> = {
    nombre: '',
    tipo: 'PIPETA' as TipoProducto,
    precio: 0,
    stock: 0,
    descripcion: '',
    peso: '',
    activo: true
  };

  imagenPreview = signal<string | null>(null);
  guardando = signal(false);

  tipos = ['PIPETA', 'ACCESORIO', 'REPUESTO'];

 constructor() {
  addIcons({cube,addCircle,pricetag,grid,scale,cash,documentText,image,trash,save});
}

  ngOnInit() {}

  async seleccionarImagen(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      this.toastService.error('Por favor selecciona una imagen válida');
      return;
    }

    // Validar tamaño (máximo 5MB)
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
    // Resetear el input file
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

  guardarProducto() {
    if (!this.validarFormulario()) return;

    this.guardando.set(true);

    // Asegurarse de que el producto tenga todos los campos requeridos
    const productoAGuardar: Producto = {
      nombre: this.producto.nombre!,
      tipo: this.producto.tipo!,
      precio: this.producto.precio!,
      stock: this.producto.stock ?? 0,
      descripcion: this.producto.descripcion,
      peso: this.producto.peso,
      imagen: this.producto.imagen,
      activo: true
    };

    this.productoService.crear(productoAGuardar).subscribe({
      next: (productoCreado) => {
        this.toastService.success('Producto creado exitosamente');
        this.resetearFormulario();
        this.guardando.set(false);
      },
      error: (error) => {
        console.error('Error al crear producto:', error);
        this.toastService.error('Error al crear el producto');
        this.guardando.set(false);
      }
    });
  }

  resetearFormulario() {
    this.producto = {
      nombre: '',
      tipo: 'PIPETA' as TipoProducto,
      precio: 0,
      stock: 0,
      descripcion: '',
      peso: '',
      activo: true
    };
    this.imagenPreview.set(null);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (input) input.value = '';
  }
}
