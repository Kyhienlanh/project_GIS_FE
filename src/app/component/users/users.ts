import { Component } from '@angular/core';

@Component({
  selector: 'app-users',
  imports: [],
  templateUrl: './users.html',
  styleUrl: './users.css'
})
export class Users {
  canActivate(): boolean {
    const token = localStorage.getItem('token'); 
    if (token) {
      return true;
    }
    return false;
  }
  constructor(){
    console.log(this.canActivate());
  }
}
