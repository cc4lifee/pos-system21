import { HttpClient } from '@angular/common/http';
import { computed, inject, Service, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Products } from '../../../shared/interfaces/products.interface';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';

@Service()
export class ProductService {
  private readonly http = inject(HttpClient);

  private readonly baseUrl = `${environment.baseUrl}`;

  products = signal<Products[]>([]);

  public readonly productsCount = computed(() => this.products().length);

  async getProducts(): Promise<void> {
    const products = await firstValueFrom(this.http.get<Products[]>(`${this.baseUrl}/products`));

    this.products.set(products);
  }
}
