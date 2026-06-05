import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Login } from "../../component/login/login";
import { RouterModule, RouterOutlet } from "@angular/router";

@Component({
  selector: 'app-auth-page',
  imports: [RouterOutlet],
  templateUrl: './auth-page.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './auth-page.scss',
})
export class AuthPage {

}
