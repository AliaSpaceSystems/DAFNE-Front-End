import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { interval, Subscription } from 'rxjs';
import { AppConfig } from '../../services/app.config';

@Component({
  selector: 'app-dhs-connected',
  templateUrl: './dhs-connected.component.html',
  styleUrls: ['./dhs-connected.component.css']
})
export class DhsConnectedComponent implements OnInit, OnDestroy {
  public dataRefreshTime = AppConfig.settings.dataRefreshTime;
  subscription: Subscription;

  public numOfDhsConnected;
  private localId: number;  
  constructor(private authenticationService: AuthenticationService) { }

  ngOnInit(): void {
    if (this.subscription != undefined) {
      this.subscription.unsubscribe();
    }
    const dataRefresh = interval(this.dataRefreshTime);

    this.getDHSConnected();
    this.subscription = dataRefresh.subscribe(n => {
      // get data after Init every x milliseconds:
      this.getDHSConnected();
    });
  }

  ngOnDestroy(): void {
    if (this.subscription != undefined) {
      this.subscription.unsubscribe();
    }
  }

  getDHSConnected():any {
    this.authenticationService.getAllCentres().subscribe(
      (res: object) => {
        if (Object.values(res).filter((x) => x.local == true)[0]) {
          this.localId = Object.values(res).filter((x) => x.local == true)[0].id;
          this.authenticationService.getMapDHSConnected(this.localId).subscribe(
            (res: object) => {
              var result = Object.values(res).filter((x) => x.local === null);
              this.numOfDhsConnected = result.length;
            }
          );
        } else {
          this.localId = -1;
        }
      }
    );
  }

  refreshDHSConnected() {
    this.getDHSConnected();
  }
}
