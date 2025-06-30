import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-left-sidebar',
  imports: [RouterModule,CommonModule],
  templateUrl: './left-sidebar.html',
  styleUrl: './left-sidebar.css'
})
export class LeftSidebar {
    isLeftSidebarCollapsed=input.required<boolean>()
    changeIsLeftSidebarCollapsed=output<boolean>()
   items = [
    {
      routeLink: 'layer',
      icon: 'fa-solid fa-map-location-dot',
      label: 'layer',
    },
    {
      routeLink: 'users',
      icon: 'fas fa-user',
      label: 'users',
    },
    {
      routeLink: 'pages',
      icon: 'fal fa-file',
      label: 'Pages',
    },
    {
      routeLink: 'settings',
      icon: 'fal fa-cog',
      label: 'Settings',
    },
  ];
  toggleCollapse():void{
    this.changeIsLeftSidebarCollapsed.emit(!this.isLeftSidebarCollapsed());
  }
  closeSideNav():void{
    this.changeIsLeftSidebarCollapsed.emit(true);
  }
}
