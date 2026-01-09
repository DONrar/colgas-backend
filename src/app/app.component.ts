import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonApp, IonRouterOutlet, IonItem, IonLabel, IonIcon, IonMenuToggle, IonContent, IonList, IonToolbar, IonHeader, IonTitle, IonMenu, IonButtons, IonButton } from '@ionic/angular/standalone';
import { MenuController } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { carOutline, clipboardOutline, gridOutline, statsChartOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonButton, IonButtons, IonTitle, IonHeader, IonToolbar, IonList, IonContent, IonIcon, IonLabel, IonItem, IonApp, IonRouterOutlet, IonMenuToggle, IonMenu, RouterLink],
})
export class AppComponent {
  constructor(private menuController: MenuController) {
    addIcons({gridOutline, statsChartOutline,clipboardOutline, carOutline});
  }

  cerrarMenu() {
    this.menuController.close();
  }

  async ngOnInit() {
    if (Capacitor.getPlatform() === 'android') {
      try {
        await StatusBar.setOverlaysWebView({ overlay: false });

        // 2) color y estilo de iconos de la status bar (ajústalo a tu toolbar)
        await StatusBar.setBackgroundColor({ color: '#132440' }); // tu color del header
        await StatusBar.setStyle({ style: Style.Light }); // iconos claros sobre fondo oscuro
      } catch {}
    }
  }
}
