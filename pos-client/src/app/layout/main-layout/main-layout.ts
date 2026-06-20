import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SideNavPane } from '../../shared/components/side-nav/components/side-nav-pane/side-nav-pane';
import { CategoryService } from '../../management/categories/services/categories';
import { ProductService } from '../../management/products/services/product-service';
import { OrderService } from '../../management/orders/services/order-service';

@Component({
  selector: 'app-main-layout',
  imports: [SideNavPane, RouterOutlet],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout {
  private readonly categoryService = inject(CategoryService);
  private readonly productService = inject(ProductService);

  ngOnInit() {
    this.categoryService.getCategories();
    this.productService.getProducts();
  }
}
