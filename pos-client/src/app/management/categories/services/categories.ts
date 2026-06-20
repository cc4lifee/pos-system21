import { inject, Service, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, httpResource } from '@angular/common/http';
import { Categories } from '../../../shared/interfaces/categories.interface';
import { firstValueFrom } from 'rxjs';

@Service()
export class CategorieService {
  private readonly http = inject(HttpClient);

  private readonly baseUrl = `${environment.baseUrl}`;

  categories = signal<Categories[]>([]);

  async getCategories(): Promise<Categories[]> {
    const categories = await firstValueFrom(
      this.http.get<Categories[]>(`${this.baseUrl}/categories`),
    );

    console.log(categories);
    this.categories.set(categories);

    return categories;
  }
}
