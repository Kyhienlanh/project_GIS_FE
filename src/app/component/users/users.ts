import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user';
import { User } from '../../model/user.model';
import { FormsModule } from '@angular/forms';
declare var bootstrap: any;
@Component({
  selector: 'app-users',
  standalone: true,
  templateUrl: './users.html',
  styleUrls: ['./users.css'],
  imports: [
    CommonModule,
    FormsModule
    
  ]
})
  export class Users implements OnInit{
  newUser: User = {
  userID: 0,
  username: '',
  email: '',
  fullName: '',
  dateOfBirth: '',
  phoneNumber: '',
  profileImage: '',
  createdAt: '',
  updatedAt: '',
  status: 1,
  pass: ''
};

    constructor(private userService: UserService) {}
     users: User[] = [];
    canActivate(): boolean {
      const token = localStorage.getItem('token'); 
      if (token) {
        return true;
      }
      return false;
    }
   ngOnInit(): void {
    this.userService.getUsers().subscribe({
      next: (data) => (this.users = data),
      error: (err) => console.error(err)
    });
  }
   onAddUser() {
    console.log('Thêm người dùng');

  }

  onEditUser(user: User) {
    console.log('Sửa người dùng:', user);
  }

  onDeleteUser(userID: number) {
  if (confirm('Bạn có chắc chắn muốn xoá người dùng này?')) {
    this.userService.deleteUser(userID).subscribe({
      next: () => {
        this.users = this.users.filter(user => user.userID !== userID);
        console.log('Đã xoá người dùng có ID:', userID);
      },
      error: err => console.error(err)
    });
  }
}
submitAddUser() {
  this.userService.addUser(this.newUser).subscribe({
    next: (user) => {
      this.users.push(user); // Cập nhật danh sách
      this.resetNewUser();
      this.closeModal();
    },
    error: err => console.error('Lỗi khi thêm người dùng:', err)
  });
}
resetNewUser() {
  this.newUser = {
    userID: 0,
    username: '',
    email: '',
    fullName: '',
    dateOfBirth: '',
    phoneNumber: '',
    profileImage: '',
    createdAt: '',
    updatedAt: '',
    status: 1,
    pass: ''
  };
}

closeModal() {
  const modalEl = document.getElementById('addUserModal');
  if (modalEl) {
    // Bootstrap 5
    const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
    modal.hide();
  }
}


}

