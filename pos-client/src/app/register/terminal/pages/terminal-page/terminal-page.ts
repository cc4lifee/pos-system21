import { Component } from '@angular/core';
import { Header } from '../../../../shared/components/header/header';
import { ProductCatalog } from '../../components/product-catalog/product-catalog';
import { SaleTerminal } from '../../components/sale-terminal/sale-terminal';

@Component({
  selector: 'app-terminal-page',
  standalone: true,
  imports: [Header, ProductCatalog, SaleTerminal],
  templateUrl: './terminal-page.html',
  styleUrl: './terminal-page.scss',
})
export class TerminalPage {}
