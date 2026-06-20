import { Component, inject } from '@angular/core';
import { Header } from '../../../../shared/components/header/header';
import { OrderService } from '../../services/order-service';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { CurrencyPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'app-orders-page',
  imports: [Header, MatTableModule, MatChipsModule, CurrencyPipe, DatePipe],
  templateUrl: './orders-page.html',
  styleUrl: './orders-page.scss',
})
export class OrdersPage {
  public readonly orderService = inject(OrderService);

  readonly columns = ['orderNumber', 'items', 'total', 'status', 'createdAt'];

  async ngOnInit() {
    await this.orderService.getOrderStats();
    await this.orderService.getOrders();

    console.log(this.orderService.orders());
  }
}
