import { Component } from '@angular/core';
import { AuthService } from '../../services/auth-service';
import { AsyncPipe, CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [AsyncPipe, RouterLink, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {  
  isLoggedIn$:Observable<boolean>;
  userRole$:Observable<string | null>;
  dropdownOpen: boolean = false;

  constructor(private authService:AuthService, private router:Router) {
    this.isLoggedIn$ = this.authService.isLoggedIn$;
    this.userRole$ = this.authService.userRole$;
  }

  
  logout(){
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  toggleDropdown(){
    this.dropdownOpen = !this.dropdownOpen;
  }

  closeDropdown(){
    this.dropdownOpen = false;
  }
  
}
