import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonInput,
  IonItem,
  IonLabel,
  IonButtons,
  IonIcon,
  ModalController, IonBackButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { close, add, remove } from 'ionicons/icons';
import { ProductoService } from '../../../core/services/producto-service';
import { ToastService } from '../../../core/services/toast-service';
import { Producto } from '../../../core/models/producto.model';
@Component({
  selector: 'app-admin-modal-stock',
  templateUrl: './admin-modal-stock.page.html',
  styleUrls: ['./admin-modal-stock.page.scss'],
  standalone: true,
  imports: [ CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonInput,
    IonItem,
    IonLabel,
    IonButtons,
    IonIcon]
})
export class AdminModalStockPage {
 @Input() producto!: Producto;

  private modalCtrl = inject(ModalController);
  private productoService = inject(ProductoService);
  private toastService = inject(ToastService);

  stockActual: number = 0;
  cantidadCambio: number = 0;

  constructor() {
    addIcons({ close, add, remove });
  }

  ngOnInit() {
    this.stockActual = this.producto.stock ?? 0;
  }

  cerrar() {
    this.modalCtrl.dismiss();
  }

  ajustarCantidad(valor: number) {
    this.cantidadCambio += valor;
  }

  get nuevoStock(): number {
    return Math.max(0, this.stockActual + this.cantidadCambio);
  }

  guardarCambios() {
    const nuevoStock = this.nuevoStock;

    this.productoService.actualizarStock(this.producto.id!, nuevoStock).subscribe({
      next: (productoActualizado) => {
        this.toastService.success('Stock actualizado correctamente');
        this.modalCtrl.dismiss(productoActualizado, 'actualizado');
      },
      error: (error) => {
        console.error('Error al actualizar stock:', error);
        this.toastService.error('Error al actualizar el stock');
      }
    });
  }

}
