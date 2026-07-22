import { User } from './auth.interface';

export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  roleId?: string;
  role?: string;
}

export interface UpdateUserInput {
  name?: string;
  roleId?: string;
  role?: string;
  isActive?: boolean;
}

// POST /users response — no isActive/createdAt (see users.controller.ts createUser select)
export interface CreatedUser {
  id: string;
  email: string;
  name: string;
  role: User['role'];
}

// PUT /users/:id response — no createdAt
export interface UpdatedUser {
  id: string;
  email: string;
  name: string;
  role: User['role'];
  isActive: boolean;
}
