import { Component, inject } from '@angular/core';
import { Header } from '../../../../shared/components/header/header';
import { CategorieService } from '../../services/categories';
import { AuthService } from '../../../../auth/services/auth.service';

@Component({
  selector: 'app-categories-page',
  imports: [Header],
  templateUrl: './categories-page.html',
  styleUrl: './categories-page.scss',
})
export class CategoriesPage {
  public readonly categorieService = inject(CategorieService);
  public readonly authService = inject(AuthService);

  ngOnInit(): void {
    console.log(this.categorieService.getCategories());
  }
}
