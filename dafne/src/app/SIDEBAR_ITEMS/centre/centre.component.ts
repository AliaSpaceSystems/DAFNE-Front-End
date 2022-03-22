import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { interval, Subscription } from 'rxjs';
import { AppConfig } from '../../services/app.config';

@Component({
  selector: 'app-centre',
  templateUrl: './centre.component.html',
  styleUrls: ['./centre.component.css']
})
export class CentreComponent implements OnInit, OnDestroy {
  public dataRefreshTime = AppConfig.settings.dataRefreshTime;
  subscription: Subscription;

  public localCentre = {
    name: "",
    color: "#ffffff"
  };
  constructor(private authenticationService: AuthenticationService) { }

  ngOnInit(): void {
    if (this.subscription != undefined) {
      this.subscription.unsubscribe();
    }
    const dataRefresh = interval(this.dataRefreshTime);

    this.getLocalCentre();
    this.subscription = dataRefresh.subscribe(n => {
      // get data after Init every x milliseconds:
      this.getLocalCentre();
    });
  }

  ngOnDestroy(): void {
    if (this.subscription != undefined) {
      this.subscription.unsubscribe();
    }
  }
  
  getLocalCentre() {
    this.authenticationService.getAllCentres().subscribe(
      (res: object) => {
        if (Object.values(res).filter((x) => x.local == true)[0]) {
          this.localCentre = Object.values(res).filter((x) => x.local == true)[0];
        } else {
          this.localCentre = {
            name: "",
            color: "#ffffff"
          };
        }
      }
    );
  }
}
