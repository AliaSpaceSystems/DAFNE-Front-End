import { Component, OnInit, Inject} from '@angular/core';
import { AppConfig } from 'src/app/services/app.config';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  
  public centreLogoPath = AppConfig.settings.centreBackupLogoPath;
  public softwareVersion = AppConfig.settings.version;
  
  constructor(public authenticationService: AuthenticationService) { }

  ngOnInit(): any {
    if (AppConfig.settings.centreLogoPath != "") {
      this.centreLogoPath = AppConfig.settings.centreLogoPath;
    }
  }
}