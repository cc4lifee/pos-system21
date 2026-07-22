import { HttpClient } from '@angular/common/http';
import { computed, inject, Service, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import {
  CreateProductInput,
  ProductRaw,
  Products,
  UpdateProductInput,
} from '../../../shared/interfaces/products.interface';
import { firstValueFrom } from 'rxjs';

@Service()
export class ProductService {
  private readonly http = inject(HttpClient);

  private readonly baseUrl = `${environment.baseUrl}/products`;

  products = signal<Products[]>([]);

  public readonly productsCount = computed(() => this.products().length);

  async getProducts(): Promise<void> {
    const products = await firstValueFrom(this.http.get<Products[]>(this.baseUrl));

    this.products.set(products);
  }

  async getProductById(productId: string): Promise<Products> {
    return await firstValueFrom(this.http.get<Products>(`${this.baseUrl}/${productId}`));
  }

  async createProduct(input: CreateProductInput): Promise<ProductRaw> {
    const product = await firstValueFrom(this.http.post<ProductRaw>(this.baseUrl, input));
    await this.getProducts();
    return product;
  }

  async updateProduct(productId: string, input: UpdateProductInput): Promise<ProductRaw> {
    const product = await firstValueFrom(
      this.http.put<ProductRaw>(`${this.baseUrl}/${productId}`, input),
    );
    await this.getProducts();
    return product;
  }

  async deleteProduct(productId: string): Promise<void> {
    await firstValueFrom(this.http.delete<{ message: string }>(`${this.baseUrl}/${productId}`));
    await this.getProducts();
  }
}
