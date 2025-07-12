import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
@Component({
  selector: 'app-login',
  imports: [  FormsModule, HttpClientModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  username: string = '';
  password: string = '';

  constructor(private http: HttpClient,private router:Router) {}
  
  onSubmit() {
    const loginData = {
      Username: this.username,
      pass: this.password,
    };
    console.log(this.username);
    console.log(this.password);
    this.http.post('https://localhost:7035/api/authentication', loginData).subscribe({
      next: (res: any) => {
        console.log('Token:', res.token);
        localStorage.setItem('token', res.token); 
        
        this.router.navigate(['/layer']);
      },
      error: (err) => {
        console.error(err);
        alert('Sai tên đăng nhập hoặc mật khẩu');
      },
    });
  }
 
}
