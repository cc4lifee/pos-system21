import { computed, inject, Service, signal } from '@angular/core';
import {
  CreateOrderInput,
  CreateOrderPaymentInput,
  MonthlyStatsOrders,
  OrderDetail,
  Orders,
  OrderStats,
  OrderStatusUpdateResult,
  OrderStatusValue,
  PayOrderResult,
  PendingOrder,
} from '../../../shared/interfaces/orders.interface';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Service()
export class OrderService {
  private readonly http = inject(HttpClient);

  private readonly baseUrl = `${environment.baseUrl}`;

  public orders = signal<Orders[]>([]);
  public pendingOrders = signal<PendingOrder[]>([]);
  public orderStats = signal<OrderStats | null>(null);
  public monthlyStatsOrders = signal<MonthlyStatsOrders | null>(null);
  public selectedOrder = signal<OrderDetail | null>(null);

  async getOrders(): Promise<void> {
    const orders = await firstValueFrom(this.http.get<Orders[]>(`${this.baseUrl}/orders`));
    this.orders.set(orders);
  }

  async getPendingOrders(): Promise<void> {
    const orders = await firstValueFrom(
      this.http.get<PendingOrder[]>(`${this.baseUrl}/orders/pending`),
    );
    this.pendingOrders.set(orders);
  }

  async getOrderStats(): Promise<void> {
    const orders = await firstValueFrom(this.http.get<OrderStats>(`${this.baseUrl}/orders/stats`));
    this.orderStats.set(orders);
  }

  async getMonthlyStatsOrders(): Promise<void> {
    const monthlyStatsOrders = await firstValueFrom(
      this.http.get<MonthlyStatsOrders>(`${this.baseUrl}/orders/monthlyStats`),
    );
    this.monthlyStatsOrders.set(monthlyStatsOrders);
  }

  async getOrderById(orderId: string): Promise<OrderDetail> {
    const order = await firstValueFrom(
      this.http.get<OrderDetail>(`${this.baseUrl}/orders/${orderId}`),
    );
    this.selectedOrder.set(order);
    return order;
  }

  async createOrder(input: CreateOrderInput): Promise<OrderDetail> {
    const order = await firstValueFrom(
      this.http.post<OrderDetail>(`${this.baseUrl}/orders`, input),
    );
    this.selectedOrder.set(order);
    return order;
  }

  async payOrder(orderId: string, payments: CreateOrderPaymentInput[]): Promise<PayOrderResult> {
    const order = await firstValueFrom(
      this.http.post<PayOrderResult>(`${this.baseUrl}/orders/${orderId}/pay`, { payments }),
    );
    this.selectedOrder.set(order);
    return order;
  }

  async updateOrderStatus(
    orderId: string,
    status: OrderStatusValue,
  ): Promise<OrderStatusUpdateResult> {
    return await firstValueFrom(
      this.http.patch<OrderStatusUpdateResult>(`${this.baseUrl}/orders/${orderId}/status`, {
        status,
      }),
    );
  }
}
