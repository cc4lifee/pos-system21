import { Component } from '@angular/core';
import { Login } from "../../component/login/login";
import { RouterModule, RouterOutlet } from "@angular/router";

@Component({
  selector: 'app-auth-page',
  imports: [RouterOutlet],
  templateUrl: './auth-page.html',
  styleUrl: './auth-page.scss',
})
export class AuthPage {

}
