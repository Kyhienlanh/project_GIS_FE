
import { Component, HostListener, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LeftSidebar } from '../left-sidebar/left-sidebar';
import { Main } from '../main/main';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet,LeftSidebar,Main],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css'
})
export class MainLayout implements OnInit{
    protected title = 'project_gis';
  isLeftSidebarCollapsed =signal<boolean>(false);
  screenWidth=signal<number>(window.innerWidth);
  @HostListener('window:resize')
  onResize(){
    this.screenWidth.set(window.innerWidth);
    if(this.screenWidth()<768){
      this.isLeftSidebarCollapsed.set(true);
    }
  }
  ngOnInit(): void {
    this.isLeftSidebarCollapsed.set(this.screenWidth()<768);
  }
  changeIsLeftSidebarCollapsed(isLeftSidebarCollapsed:boolean):void{
    this.isLeftSidebarCollapsed.set(isLeftSidebarCollapsed);
  }
}

