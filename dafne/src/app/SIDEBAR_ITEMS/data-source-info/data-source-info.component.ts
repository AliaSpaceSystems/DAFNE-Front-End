import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { interval, Subscription } from 'rxjs';
import { AppConfig } from '../../services/app.config';

declare var $: any;

@Component({
  selector: 'app-data-source-info',
  templateUrl: './data-source-info.component.html',
  styleUrls: ['./data-source-info.component.css']
})
export class DataSourceInfoComponent implements OnInit, OnDestroy {
  public dataRefreshTime = AppConfig.settings.dataRefreshTime;
  subscription: Subscription;

  public dataSourcesList;
  private localId: number = -1;

  constructor(private authenticationService: AuthenticationService) { }

  ngOnInit(): void {
    if (this.subscription != undefined) {
      this.subscription.unsubscribe();
    }
    const dataRefresh = interval(this.dataRefreshTime);

    this.getDataSourcesInfo();
    this.subscription = dataRefresh.subscribe(n => {
      // get data after Init every x milliseconds:
      this.getDataSourcesInfo();
    });
  }

  ngOnDestroy(): void {
    if (this.subscription != undefined) {
      this.subscription.unsubscribe();
    }
  }

  getDataSourcesInfo() {
    this.authenticationService.getAllCentres().subscribe(
      (res: object) => {
        if (Object.values(res).filter((x) => x.local == true)[0]) {
          this.localId = Object.values(res).filter((x) => x.local == true)[0].id;
        } else {
          this.localId = -1;
        }
        this.authenticationService.getDataSourcesInfo(this.localId).subscribe(
          (res: object) => {
            this.dataSourcesList = res;
            this.dataSourcesList.sort(this.getSortCentreOrder("name"));
          }
        );
      }
    );
  }

  refreshDataSources() {
    this.getDataSourcesInfo();
  }

  /* Function to sort arrays of object: */    
  getSortCentreOrder(prop) {
    return function(a, b) {
        if (a.centre[prop] > b.centre[prop]) {    
            return 1;    
        } else if (a.centre[prop] < b.centre[prop]) {    
            return -1;    
        }    
        return 0;    
    }    
  } 
}
