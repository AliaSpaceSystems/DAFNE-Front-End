import { Component } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';

declare var $: any;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  public isAuthenticated = false;

  constructor(
    public authenticationService: AuthenticationService
  ) {  }

  /* Hide menu if not authenticated */
  checkUserAuthenticated() {
    if (this.authenticationService.isAuthenticated) {      
      $(".dropdown-menu").css("visibility", "visible");
    } else {
      $(".dropdown-menu").css("visibility", "hidden");
    }
  }

  logout() {
    this.authenticationService.logout().subscribe(
      (res: object) => {
        localStorage.removeItem('token');
        this.authenticationService.isAuthenticated = false;
        this.authenticationService.currentUser = null;
        window.location.reload();
      },
      error => {
        console.log(error);
        console.log(error.status);
      });
  }
}