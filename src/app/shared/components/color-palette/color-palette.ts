import { Component } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-color-palette',
  imports: [MatButtonModule, MatDividerModule, MatIconModule],
  templateUrl: './color-palette.html',
  styleUrl: './color-palette.scss',
})
export class ColorPalette {

}
