import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth-service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  loginForm: FormGroup;
  constructor(private _authService: AuthService, private _router: Router) {
      this.loginForm = new FormGroup({
      email: new FormControl(''),
      password: new FormControl(''),
    });
  }


  onSubmit() {
    const email = this.loginForm.get('email')?.value;
    const password = this.loginForm.get('password')?.value;
    this._authService.login(email, password).subscribe({
    next: (res) => {
      console.log('Login successful', res);
      this._router.navigate(['/home']);
    },
    error: (err) => {
      console.error('Login failed', err);
    }});
  }
}
