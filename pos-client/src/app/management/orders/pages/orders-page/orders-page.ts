import { Component, inject, ViewChild } from '@angular/core';
import { Header } from '../../../../shared/components/header/header';
import { OrderService } from '../../services/order-service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { Orders } from '../../../../shared/interfaces/orders.interface';

@Component({
  selector: 'app-orders-page',
  imports: [
    Header,
    MatTableModule,
    MatChipsModule,
    MatPaginatorModule,
    MatSortModule,
    CurrencyPipe,
    DatePipe,
  ],
  templateUrl: './orders-page.html',
  styleUrl: './orders-page.scss',
})
export class OrdersPage {
  public readonly orderService = inject(OrderService);

  readonly columns = ['orderNumber', 'items', 'total', 'status', 'createdAt'];

  dataSource = new MatTableDataSource<Orders>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  async ngOnInit() {
    await this.orderService.getOrderStats();
    await this.orderService.getOrders();

    this.dataSource.data = this.orderService.orders();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
}
