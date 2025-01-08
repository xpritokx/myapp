import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { logoutButtonEnable } from '../../actions/buttons.actions';
import { Router } from '@angular/router';
import { IAuthResponse } from '../../interfaces/auth.interface';

@Component({
  selector: 'app-auth',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section  class="auth-form">
        <h1 class="auth-title"> Stair Shoppe Management </h1>
        <form [formGroup]="authForm" (submit)="signIn()">
          <label for="username">Username</label>
          <input id="username" type="text" formControlName="username" />
          <label for="password">Password</label>
          <input id="password" type="text" formControlName="password" />
          <button type="submit" class="button-3" role="button">Sign In</button>
        </form>
    </section>
  `,
  styleUrls: ['./auth.component.scss'],
})
export class AuthComponent {
  authService = inject(AuthService);
  authForm = new FormGroup({
    username: new FormControl(''),
    password: new FormControl(''),
  });

  constructor(
    private store: Store<{ count: boolean }>,
    private router: Router
  ) {}

  async signIn() {
    const result: IAuthResponse = await this.authService.signIn(
      this.authForm.value.username ?? '',
      this.authForm.value.password ?? '',
    );

    if (result?.token) {
      this.store.dispatch(logoutButtonEnable());
      this.router.navigate(['/home']);
    }
  }
}
