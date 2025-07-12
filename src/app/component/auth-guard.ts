import { CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const token = localStorage.getItem('token');

  if (token) {
    return true; 
  } else {
    window.alert('Bạn cần đăng nhập để truy cập!');
    window.location.href = '/login'; 
    return false;
  }
};
