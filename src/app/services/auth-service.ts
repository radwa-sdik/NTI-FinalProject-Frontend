import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../models/user';
import { BehaviorSubject, tap } from 'rxjs';
import { LoginResponse } from '../models/login-response';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = "https://nti-final-project-backend.onrender.com/api/users";
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  private userRoleSubject = new BehaviorSubject<string | null>(
    localStorage.getItem('userRole')
  );
  userRole$ = this.userRoleSubject.asObservable();

  private userIdSubject = new BehaviorSubject<string | null>(
    localStorage.getItem('userId')
  );
  currentUserId$ = this.userIdSubject.asObservable();

  constructor(private _httpClient: HttpClient){}

  login(email:string,password:string) {
    return this._httpClient.post<LoginResponse>(`${this.apiUrl}/login`,{email:email,password:password})
      .pipe(tap(res =>{
        localStorage.setItem('token',res.Token);
        let user = jwtDecode(res.Token) as {role:'User'|'Admin',userId:string};
        localStorage.setItem('userRole', user.role);
        localStorage.setItem('userId',user.userId);

        this.isLoggedInSubject.next(true);
        this.userRoleSubject.next(user.role);
      }))

  }

  register(newUser:User){
    return this._httpClient.post(`${this.apiUrl}/register`, newUser);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('userId')

    this.isLoggedInSubject.next(false);
    this.userRoleSubject.next(null);
    this.userIdSubject.next(null);
  }

  getToken():string | null{
    return localStorage.getItem('token');
  }

  getUserRole():'User'|'Admin'|null{
    return localStorage.getItem('userRole') as 'User' | 'Admin' | null;
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }
}
