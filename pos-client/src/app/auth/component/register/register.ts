import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { form, FormField, required, email, minLength } from '@angular/forms/signals';

import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

@Component({
  selector: 'app-register',
  imports: [FormField, MatCardModule, MatInputModule, MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './register.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './register.scss',
})
export class Register {
  registerModel = signal<RegisterData>({
    name: '',
    email: '',
    password: '',
  });

  registerForm = form(this.registerModel, (path) => {
    // NAME
    required(path.name, { message: 'Name is required' });
    minLength(path.name, 3, {
      message: 'Name must be at least 3 characters',
    });

    // EMAIL
    required(path.email, { message: 'Email is required' });
    email(path.email, { message: 'Enter a valid email address' });

    // PASSWORD
    required(path.password, { message: 'Password is required' });
    minLength(path.password, 8, {
      message: 'Password must be at least 8 characters',
    });
  });

  onSubmit(event: Event) {
    event.preventDefault();
    const data = this.registerModel();
    console.log('Register:', data);
  }
}
