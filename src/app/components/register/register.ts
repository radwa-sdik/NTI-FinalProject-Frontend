import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from "@angular/router";
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-register',
  imports: [RouterLink,ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  registerForm: FormGroup;

  constructor(private _authService: AuthService, private _router: Router) {
    this.registerForm = new FormGroup({
      firstName: new FormControl(''),
      lastName: new FormControl(''),
      email: new FormControl(''),
      password: new FormControl(''),
      phone: new FormControl(''),
      role: new FormControl('User'),
    });
  }

  onSubmit(){
    if(this.registerForm.valid){
      this._authService.register(this.registerForm.value).subscribe({
        next: (response)=>{
          console.log('Registration successful', response);
          this._router.navigate(['/auth/login']);
        },
        error: (error)=>{
          console.error('Registration failed', error);
        }
      });
    }
  }
}
