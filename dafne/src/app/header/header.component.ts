import { Component, ElementRef, AfterViewInit } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { Router } from '@angular/router';

declare var $: any;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements AfterViewInit {
  public isAuthenticated = false;

  constructor(
    public authenticationService: AuthenticationService,
    private elementRef: ElementRef,
    private router: Router
  ) {  }

  ngAfterViewInit(): void {
    this.elementRef.nativeElement.querySelector('.home-icon').addEventListener("click", this.navHome.bind(this));
  }
  /* Hide menu if not authenticated */
  checkUserAuthenticated() {
    if (this.authenticationService.isAuthenticated) {      
      //$(".dropdown-menu").css("visibility", "visible");
      $(".dropdown-menu").css("display", "inline");
    } else {
      //$(".dropdown-menu").css("visibility", "hidden");
      $(".dropdown-menu").css("display", "none");
    }
  }
  ddLinkClicked() {
    $(".dropdown-menu").css("display", "none");
  }

  navHome(event) {
    if (this.authenticationService.isAuthenticated) {
      this.router.navigate(['/gui', { outlets: { centralBodyRouter: ['network-component', 'homeView']}}], { skipLocationChange: true });
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