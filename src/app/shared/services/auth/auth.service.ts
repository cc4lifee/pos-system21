import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface ApiResponse {
  type: 'Success' | 'Warning' | 'Failure';
  statusCode: number;
  message: string;
  rowsAffected?: number;
  data?: any;
}

export interface User {
  email?: string;
  firstname?: string;
  full_name: string;
  lastname: string;
  phone1?: string;
  token: string;
  role?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class Auth {

  private readonly http = inject(HttpClient);


   private _token = '';

    get token(): string {
    return this._token;
  }

//hacer esto con signals?
   private readonly loggedInUserSubject = new BehaviorSubject<User>({} as User);
  loggedInUser$ = this.loggedInUserSubject.asObservable();



  getLoggedInUser = (): Observable<User> => {
    return this.http
      .get<ApiResponse>(`${environment.NODE_URL}${environment.NODE_API_CONTEXT_ROOT}/login`)
      .pipe(
        map((apiResponse) => {
          const user = this.processLoginResponse(apiResponse);
          return user;
        })
      );
  };


  public processLoginResponse = (apiResponse: ApiResponse): User => {
    const user = apiResponse.data as User;
    this._token = user.token;
    this.loggedInUserSubject.next(user);
    return user;
  };
}
