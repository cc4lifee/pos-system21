import { computed, inject, Service, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  CreatePromotionInput,
  Promotion,
  UpdatePromotionInput,
} from '../../../shared/interfaces/promotions.interface';

@Service()
export class PromotionService {
  private readonly http = inject(HttpClient);

  private readonly baseUrl = `${environment.baseUrl}/promotions`;

  promotions = signal<Promotion[]>([]);

  public readonly promotionsCount = computed(() => this.promotions().length);

  async getPromotions(): Promise<void> {
    const promotions = await firstValueFrom(this.http.get<Promotion[]>(this.baseUrl));
    this.promotions.set(promotions);
  }

  async getPromotionById(promotionId: string): Promise<Promotion> {
    return await firstValueFrom(this.http.get<Promotion>(`${this.baseUrl}/${promotionId}`));
  }

  async createPromotion(input: CreatePromotionInput): Promise<Promotion> {
    const promotion = await firstValueFrom(this.http.post<Promotion>(this.baseUrl, input));
    await this.getPromotions();
    return promotion;
  }

  async updatePromotion(promotionId: string, input: UpdatePromotionInput): Promise<Promotion> {
    const promotion = await firstValueFrom(
      this.http.put<Promotion>(`${this.baseUrl}/${promotionId}`, input),
    );
    await this.getPromotions();
    return promotion;
  }
}
