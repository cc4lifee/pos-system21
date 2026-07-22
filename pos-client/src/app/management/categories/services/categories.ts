import { computed, inject, Service, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import {
  Categories,
  CategoryDetail,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '../../../shared/interfaces/categories.interface';
import { firstValueFrom } from 'rxjs';

@Service()
export class CategoryService {
  private readonly http = inject(HttpClient);

  private readonly baseUrl = `${environment.baseUrl}/categories`;

  categories = signal<Categories[]>([]);

  public readonly categoriesCount = computed(() => this.categories().length);

  async getCategories(): Promise<void> {
    const categories = await firstValueFrom(this.http.get<Categories[]>(this.baseUrl));

    this.categories.set(categories);
  }

  async getCategoryById(categoryId: string): Promise<CategoryDetail> {
    return await firstValueFrom(this.http.get<CategoryDetail>(`${this.baseUrl}/${categoryId}`));
  }

  async createCategory(input: CreateCategoryInput): Promise<Categories> {
    const category = await firstValueFrom(this.http.post<Categories>(this.baseUrl, input));
    await this.getCategories();
    return category;
  }

  async updateCategory(categoryId: string, input: UpdateCategoryInput): Promise<Categories> {
    const category = await firstValueFrom(
      this.http.put<Categories>(`${this.baseUrl}/${categoryId}`, input),
    );
    await this.getCategories();
    return category;
  }

  async deleteCategory(categoryId: string): Promise<void> {
    await firstValueFrom(this.http.delete<{ message: string }>(`${this.baseUrl}/${categoryId}`));
    await this.getCategories();
  }
}
