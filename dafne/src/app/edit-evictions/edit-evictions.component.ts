import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { Eviction } from '../models/eviction';

declare var $: any;

@Component({
  selector: 'app-edit-evictions',
  templateUrl: './edit-evictions.component.html',
  styleUrls: ['./edit-evictions.component.css']
})
export class EditEvictionsComponent implements OnInit {

  public isLocalConfigured = true;
  public evictionList = [];
  public collectionsList = [];
  public unitList = [];
  public syncBackendLength: number = 0;
  public syncBackendLengthArray = [];
  public tempServiceUrlBackendNumber: number = 0;

  public currentEviction: Eviction = new Eviction();

  public localCentre = {
    name: "",
    color: "#ffffff"
  };

  constructor(
    public authenticationService: AuthenticationService,
  ) { }

  ngOnInit(): void {
    let tempEv = new Eviction();
    tempEv.id = -1;
    tempEv.name = "Test Eviction";
    tempEv.maxEvictedProducts = 10;
    tempEv.keepPeriod = 1;
    tempEv.keepPeriodUnit = "DAYS";
    tempEv.filter = "";
    tempEv.orderBy = "true";
    tempEv.status = "";
    tempEv.targetCollection = "";
    tempEv.isSoftEviction = "false";
    tempEv.schedule = "0 0/2 * * * ?";
    tempEv.isActive = "false";
    this.evictionList.push(tempEv);
  }

  addNewEviction() {
    this.currentEviction = new Eviction();
    this.currentEviction.id = -1;
    this.currentEviction.name = "";
    this.currentEviction.maxEvictedProducts = null;
    this.currentEviction.keepPeriod = null;
    this.currentEviction.keepPeriodUnit = "DAYS";
    this.currentEviction.filter = "";
    this.currentEviction.orderBy = "true";
    this.currentEviction.status = "";
    this.currentEviction.targetCollection = "";
    this.currentEviction.isSoftEviction = "false";
    this.currentEviction.schedule = "";
    this.currentEviction.isActive = "false";
    $("#addEvictionModal").modal('toggle');
  }

  setKeepPeriodUnit(idx: number) {

  }

  setStatus(status: string) {
    
  }

  setTargetCollection(idx: number) {
    //this.eviction.targetCollection = this.collectionsList[id]; // To Be Corrected..
  }

  onAddSubmit() {

  }
}
