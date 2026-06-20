import { Component, inject } from '@angular/core';
import { Header } from '../../../../shared/components/header/header';
import { OrderService } from '../../../../management/orders/services/order-service';

@Component({
  selector: 'app-pending-orders-page',
  imports: [Header],
  templateUrl: './pending-orders-page.html',
  styleUrl: './pending-orders-page.scss',
})
export class PendingOrdersPage {
  private readonly orderService = inject(OrderService);

  async ngOnInit() {
    await this.orderService.getPendingOrders();
  }
}
