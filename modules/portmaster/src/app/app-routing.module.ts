import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SettingsComponent } from './pages/settings/settings';
import { WidgetSettingsOutletComponent } from './pages/widget-settings-outlet/widget-settings-outlet';
import { MonitorPageComponent } from './pages/monitor';
import { AppViewComponent } from './pages/app-view';
import { SupportPageComponent } from './pages/support';
import { SupportFormComponent } from './pages/support/form';
import { SpnPageComponent } from './pages/spn';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'monitor/profile/overview/overview'
  },
  {
    path: 'settings',
    component: SettingsComponent,
  },
  {
    path: 'app',
    pathMatch: 'full',
    redirectTo: 'app/overview',
  },
  {
    path: 'app/overview',
    component: AppViewComponent,
  },
  {
    path: 'app/:source/:id',
    component: AppViewComponent,
  },
  {
    path: 'monitor',
    redirectTo: 'monitor/profile/overview/overview',
  },
  {
    path: 'monitor/profile/:source/:profile',
    component: MonitorPageComponent,
  },
  {
    path: 'widget/new',
    component: WidgetSettingsOutletComponent,
  },
  {
    path: 'widget/edit/:widgetId',
    component: WidgetSettingsOutletComponent,
  },
  {
    path: 'support',
    component: SupportPageComponent,
  },
  {
    path: 'support/:id',
    component: SupportFormComponent,
  },
  {
    path: 'spn',
    component: SpnPageComponent,
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { anchorScrolling: 'enabled', relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
