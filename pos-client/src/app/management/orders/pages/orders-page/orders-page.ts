import { Component, inject } from '@angular/core';
import { Header } from '../../../../shared/components/header/header';
import { OrderService } from '../../services/order-service';

@Component({
  selector: 'app-orders-page',
  imports: [Header],
  templateUrl: './orders-page.html',
  styleUrl: './orders-page.scss',
})
export class OrdersPage {
  private readonly orderService = inject(OrderService);

  async ngOnInit() {
    await this.orderService.getOrderStats();
  }
}
