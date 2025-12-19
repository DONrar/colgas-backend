import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';
import { addIcons } from 'ionicons';
import {
  homeOutline,
  peopleOutline,
  searchOutline,
  settingsOutline,
  cashOutline,
  closeOutline,
  cubeOutline,
} from 'ionicons/icons';

// Si usas un guard SSR tipo "if (typeof window !== 'undefined')", pon esto dentro del guard.
addIcons({
  'home-outline': homeOutline,
  'people-outline': peopleOutline,
  'search-outline': searchOutline,
  'settings-outline': settingsOutline,
  'cash-outline': cashOutline,
  'close-outline': closeOutline,
  'cube-outline': cubeOutline,
});
bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient()
  ],
});
