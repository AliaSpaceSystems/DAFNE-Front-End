import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { interval, Subscription } from 'rxjs';
import { AppConfig } from '../../services/app.config';

@Component({
  selector: 'app-archive-info',
  templateUrl: './archive-info.component.html',
  styleUrls: ['./archive-info.component.css']
})
export class ArchiveInfoComponent implements OnInit, OnDestroy {
  public dataRefreshTime = AppConfig.settings.dataRefreshTime;
  subscription: Subscription;

  public archiveList;
  private localId: number;
  public localName: string = "";

  constructor(private authenticationService: AuthenticationService) { }

  ngOnInit(): void {
    if (this.subscription != undefined) {
      this.subscription.unsubscribe();
    }
    const dataRefresh = interval(this.dataRefreshTime);

    this.getRolling();
    this.subscription = dataRefresh.subscribe(n => {
      // get data after Init every x milliseconds:
      this.getRolling();
    });
  }

  ngOnDestroy(): void {
    if (this.subscription != undefined) {
      this.subscription.unsubscribe();
    }
  }

  getRolling() {
    this.authenticationService.getAllCentres().subscribe(
      (res: object) => {
        var result = Object.values(res).filter((x) => x.local === true);
        if (result[0] == undefined) {
          this.localId = -1;
          this.localName = "";
        } else {
          this.localId = result[0].id;
          this.localName = result[0].name;
          this.authenticationService.getRolling(this.localId).subscribe(
            (res: object) => {
              this.archiveList = res;
            }
          );
        }
      }
    );
  }
}