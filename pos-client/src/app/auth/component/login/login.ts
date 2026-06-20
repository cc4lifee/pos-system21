import { Component, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { debounce, email, form, FormField, minLength, required } from '@angular/forms/signals';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';

interface LoginData {
  email: string;
  password: string;
}

@Component({
  selector: 'app-login',

  imports: [
    FormField,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    FormsModule,
  ],

  templateUrl: './login.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './login.scss',
})
export class Login {
  public readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  loginModel = signal<LoginData>({
    email: '',
    password: '',
  });

  loginForm = form(this.loginModel, (schemaPath) => {
    debounce(schemaPath.email, 500);
    required(schemaPath.email, { message: 'Email is required' });
    email(schemaPath.email);
    required(schemaPath.password, { message: 'Password is required' });
  });

  async onSubmit(event: Event) {
    event.preventDefault();
    const credentials = this.loginModel();

    const success = await this.authService.login(credentials.email, credentials.password);

    if (success) {
      await this.router.navigate(['/']);
    }
  }
}
