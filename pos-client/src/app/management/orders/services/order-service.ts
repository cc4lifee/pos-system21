import { computed, inject, Service, signal } from '@angular/core';
import { MontlyStatsOrders, Orders, OrderStats } from '../../../shared/interfaces/orders.interface';
import { environment } from '../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';

@Service()
export class OrderService {
  private readonly http = inject(HttpClient);

  private readonly baseUrl = `${environment.baseUrl}`;

  public orders = signal<Orders[]>([]);
  public pendingOrders = signal<Orders[]>([]);
  public orderStats = signal<OrderStats | null>(null);
  public monthlyStatsOrders = signal<MontlyStatsOrders | null>(null);

  public readonly pendingOrdersCount = computed(
    () => this.orders().filter((order) => order.status === 'PENDING').length,
  );

  async getOrders(): Promise<void> {
    const orders = await firstValueFrom(this.http.get<Orders[]>(`${this.baseUrl}/orders`));
    this.orders.set(orders);
  }

  async getPendingOrders(): Promise<void> {
    const orders = await firstValueFrom(this.http.get<Orders[]>(`${this.baseUrl}/orders/pending`));
    this.pendingOrders.set(orders);
  }

  async getOrderStats(): Promise<void> {
    const orders = await firstValueFrom(this.http.get<OrderStats>(`${this.baseUrl}/orders/stats`));
    this.orderStats.set(orders);
  }

  async getMonthlyStatsOrders(): Promise<void> {
    const montlyStatsOrders = await firstValueFrom(
      this.http.get<MontlyStatsOrders>(`${this.baseUrl}/orders/montlyStats`),
    );
    this.monthlyStatsOrders.set(montlyStatsOrders);
  }
}
