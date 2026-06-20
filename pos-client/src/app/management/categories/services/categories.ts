import { computed, inject, Service, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Categories } from '../../../shared/interfaces/categories.interface';
import { firstValueFrom } from 'rxjs';

@Service()
export class CategoryService {
  private readonly http = inject(HttpClient);

  private readonly baseUrl = `${environment.baseUrl}`;

  categories = signal<Categories[]>([]);

  public readonly categoriesCount = computed(() => this.categories().length);

  async getCategories(): Promise<void> {
    const categories = await firstValueFrom(
      this.http.get<Categories[]>(`${this.baseUrl}/categories`),
    );

    this.categories.set(categories);
  }
}
