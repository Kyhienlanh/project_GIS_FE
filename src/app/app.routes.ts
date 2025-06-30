import { Routes } from '@angular/router';
import { Layer } from './component/layer/layer';
import { Users } from './component/users/users';

export const routes: Routes = [
     { path: '', redirectTo: '/layer', pathMatch: 'full' },
     { path: 'layer', component: Layer },
     { path: 'users', component: Users },
];
