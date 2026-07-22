import { inject, Service, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { User } from '../../../shared/interfaces/auth.interface';
import {
  CreatedUser,
  CreateUserInput,
  UpdatedUser,
  UpdateUserInput,
} from '../../../shared/interfaces/users.interface';

@Service()
export class UserService {
  private readonly http = inject(HttpClient);

  private readonly baseUrl = `${environment.baseUrl}/users`;

  users = signal<User[]>([]);

  async getUsers(): Promise<void> {
    const users = await firstValueFrom(this.http.get<User[]>(this.baseUrl));
    this.users.set(users);
  }

  async getUserById(userId: string): Promise<User> {
    return await firstValueFrom(this.http.get<User>(`${this.baseUrl}/${userId}`));
  }

  async createUser(input: CreateUserInput): Promise<CreatedUser> {
    const user = await firstValueFrom(this.http.post<CreatedUser>(this.baseUrl, input));
    await this.getUsers();
    return user;
  }

  async updateUser(userId: string, input: UpdateUserInput): Promise<UpdatedUser> {
    const user = await firstValueFrom(
      this.http.put<UpdatedUser>(`${this.baseUrl}/${userId}`, input),
    );
    await this.getUsers();
    return user;
  }
}
