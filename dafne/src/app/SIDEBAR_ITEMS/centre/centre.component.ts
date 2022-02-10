import { Component, OnInit } from '@angular/core';
import { Centre } from 'src/app/models/centre';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
  selector: 'app-centre',
  templateUrl: './centre.component.html',
  styleUrls: ['./centre.component.css']
})
export class CentreComponent implements OnInit {
  public localCentre = {
    name: "",
    color: "#ffffff"
  };
  public centreList:any;
  public currentCentre = this.localCentre;
  constructor(private authenticationService: AuthenticationService) { }

  ngOnInit(): void {
    this.getLocalCentre();
  }

  
  getLocalCentre() {
    this.authenticationService.getAllCentres().subscribe(
      (res: object) => {
        this.centreList = res;
        this.centreList.sort(this.getSortOrder("id"));
        this.setLocalFirst(this.centreList);
        if (Object.values(res).filter((x) => x.local == true)[0]) {
          this.localCentre = Object.values(res).filter((x) => x.local == true)[0];
          this.currentCentre = this.localCentre;
        } else {
          this.localCentre = {
            name: "",
            color: "#ffffff"
          };
          this.currentCentre = this.localCentre;
        }
      }
    );
  }

  setCentreVisibility(idx) {
    this.currentCentre =this.centreList[idx];
  }

  /* Function to sort arrays of object: */
  getSortOrder(prop) {
    return function (a, b) {
      if (a[prop] > b[prop]) {
        return 1;
      } else if (a[prop] < b[prop]) {
        return -1;
      }
      return 0;
    }
  }

  /* Function to put local first */
  setLocalFirst(arr) {
    let tempLocalId = arr.filter(a => a.local == true)[0].id;
    for (var i = 0; i < arr.length; ++i) {
      if (arr[i].id == tempLocalId) {
        let tempObj = arr[i];
        arr.splice(i, 1);
        arr.unshift(tempObj);
        break;
      }
    }
  }
}
