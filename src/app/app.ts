import { Component, HostListener, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LeftSidebar } from './component/left-sidebar/left-sidebar';
import { Main } from './component/main/main';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,LeftSidebar,Main],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit{
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
