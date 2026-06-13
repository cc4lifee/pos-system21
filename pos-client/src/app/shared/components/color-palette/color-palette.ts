import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { Header } from '../header/header';

@Component({
  selector: 'app-color-palette',
  imports: [MatButtonModule, MatDividerModule, MatIconModule, Header],
  templateUrl: './color-palette.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './color-palette.scss',
})
export class ColorPalette {
  // Coffee Shop Theme Colors
  themeTitle = 'Coffee Shop Theme';
}
