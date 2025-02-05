import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { Deck, MapViewState, PickingInfo, MapView } from '@deck.gl/core';
import { GeoJsonLayer, ArcLayer, TextLayer, IconLayer } from '@deck.gl/layers';
//import { MapboxLayer } from '@deck.gl/mapbox';
import { environment } from 'src/environments/environment';
//import * as Mapboxgl from 'mapbox-gl';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { AppConfig } from '../../services/app.config';
import { AuthenticationService } from '../../services/authentication.service';
import { MessageService } from '../../services/message.service';

@Component({
  selector: 'app-network-view',
  templateUrl: './network-view.component.html',
  styleUrls: ['./network-view.component.css']
})
export class NetworkViewComponent implements AfterViewInit, OnDestroy {
  private autorefreshSubscription;
  private navigationSubscription;
  private pageRefreshed: boolean = true;
  public mapTitle = 'Network View - Active Data Sources';
  private mapType = 'homeView';
  private mapTypePrec = 'homeView';
  private sub: any;
  public data_source;
  private showArcs = false;
  private allCentreList;
  public remoteCentreList;
  public localCentre = {
    id: 0,
    name: '',
    color: 'white',
    latitude: '0.0',
    longitude: '0.0'
  };
  private localId: number;

  constructor(
    private activatedroute: ActivatedRoute,
    private authenticationService: AuthenticationService,
    private messageService: MessageService,
    private router: Router
  ) {
    this.navigationSubscription = this.router.events.subscribe((e: any) => {
      if (e instanceof NavigationEnd) {
        if (this.pageRefreshed == false) {
          this.pageRefreshed = true;
          this.ngOnInit();
        }
      }
    });

    this.autorefreshSubscription = this.messageService.invokeAutoRefresh.subscribe(() => {    
      if (this.pageRefreshed == false) {
        this.pageRefreshed = true;
        this.ngOnInit();
      }
    });
  }

  HOME_INITIAL_VIEW_STATE = {
    latitude: 48.0,
    longitude: 7.5,
    zoom: 3.5,
    bearing: 0,
    pitch: 0
  }
  ACTIVE_INITIAL_VIEW_STATE = {
    latitude: 48.0,
    longitude: 7.5,
    zoom: 4.0, // Values from 0 to 15
    bearing: 0, // POV rotation. Positive -> turn CW
    pitch: 55 // Degrees angles from 0 to 60, with 0 = Zenith
  }
  public INITIAL_VIEW_STATE = this.HOME_INITIAL_VIEW_STATE;
  //private map: Mapboxgl.Map;

  private ICON_MAPPING = {
    home: 'assets/icons/home_black_48dp.svg',
    place: 'assets/icons/place_black_48dp.svg'
  };

  ngOnInit(): any {
    if (this.sub != undefined) {
      this.sub.unsubscribe();
    }

    this.messageService.showSpinner(true);
    this.sub = this.activatedroute.paramMap.subscribe(params => {
      var tempMapType = params.get('mapType');
      this.mapType = (tempMapType != null) ? tempMapType : 'homeView';
      if (this.mapType != this.mapTypePrec) {
      }
      this.mapTypePrec = this.mapType;
      if (this.mapType == 'homeView') {
        this.mapTitle = 'Network View';
        this.INITIAL_VIEW_STATE = this.HOME_INITIAL_VIEW_STATE;
        this.showArcs = false;
        this.getAllCentres();
      } else if (this.mapType == 'dhsConnected') {
        this.mapTitle = 'Network View - Connected Data Sources';
        this.INITIAL_VIEW_STATE = this.ACTIVE_INITIAL_VIEW_STATE;
        this.showArcs = true;
        this.getDHSConnected();
      } else if (this.mapType == 'dataSourcesInfo') {
        this.mapTitle = 'Network View - Active Data Sources';
        this.INITIAL_VIEW_STATE = this.ACTIVE_INITIAL_VIEW_STATE;
        this.showArcs = true;
        this.getActiveDataSource();
      }
    });
  }

  ngAfterViewInit(): any {
    this.messageService.currentMessage.subscribe(message => {
      if (message == 'resize') {
        this.windowResize();
      }
    });
  }

  ngOnDestroy() {
    if (this.navigationSubscription != undefined) {
      this.navigationSubscription.unsubscribe();
    }
    if (this.sub != undefined) {
      this.sub.unsubscribe();
    }
    if (this.autorefreshSubscription != undefined) {
      this.autorefreshSubscription.unsubscribe();
    }
  }

  refreshPage() {
    this.router.navigate(['/gui', { outlets: { centralBodyRouter: ['network-component', this.mapType]}}], { skipLocationChange: true });
  }

  windowResize() {
    //this.map.resize();
  }

  getAllCentres(): any {
    this.authenticationService.getAllCentres().subscribe(
      (res: object) => {
        var resultForLocal = Object.values(res).filter((x) => x.local === true);
        if (resultForLocal[0] == undefined) {
          this.localId = -1;
        } else {
          this.localId = resultForLocal[0].id;
        }
        //this.data_source = res;
        this.data_source = resultForLocal;
        this.remoteCentreList = Object.values(res).filter((x) => x.local === null);
        this.remoteCentreList.sort(this.getSortOrder("id"));
        this.allCentreList = res;
        this.allCentreList.sort(this.getSortOrder("id"));
        this.checkLatLonPos(this.allCentreList);

        if (Object.values(res).filter((x) => x.local === true)[0]) {
          this.localCentre = Object.values(res).filter((x) => x.local === true)[0];
          this.messageService.setLocalPresent(true);
        } else {
          this.messageService.setLocalPresent(false);
          this.localCentre = {
            id: -1,
            name: '',
            color: 'white',
            latitude: '0.0',
            longitude: '0.0'
          };
        }
        this.initDeck();
      }
    );
  }

  getActiveDataSource(): any {
    this.authenticationService.getAllCentres().subscribe(
      (res: object) => {
        var resultForLocal = Object.values(res).filter((x) => x.local === true);
        if (resultForLocal[0] == undefined) {
          this.localId = -1;
        } else {
          this.localId = resultForLocal[0].id;
        }
        this.remoteCentreList = Object.values(res).filter((x) => x.local === null);
        this.remoteCentreList.sort(this.getSortOrder("id"));
        this.allCentreList = res;
        this.allCentreList.sort(this.getSortOrder("id"));
        this.checkLatLonPos(this.allCentreList);

        this.authenticationService.getMapDataSourcesInfo(this.localId).subscribe(
          (res: object) => {
            this.data_source = res;
            if (Object.values(res).filter((x) => x.local === true)[0]) {
              this.localCentre = Object.values(res).filter((x) => x.local === true)[0];
            } else {
              this.localCentre = {
                id: 0,
                name: '',
                color: 'white',
                latitude: '0.0',
                longitude: '0.0'
              };
            }
            this.initDeck();
          }
        );
      }
    );
  }


  getDHSConnected(): any {
    this.authenticationService.getAllCentres().subscribe(
      (res: object) => {
        var resultForLocal = Object.values(res).filter((x) => x.local === true);
        if (resultForLocal[0] == undefined) {
          this.localId = -1;
        } else {
          this.localId = resultForLocal[0].id;
        }
        this.remoteCentreList = Object.values(res).filter((x) => x.local === null);
        this.remoteCentreList.sort(this.getSortOrder("id"));
        this.allCentreList = res;
        this.allCentreList.sort(this.getSortOrder("id"));
        this.checkLatLonPos(this.allCentreList);

        this.authenticationService.getMapDHSConnected(this.localId).subscribe(
          (res: object) => {
            this.data_source = res;
            if (Object.values(res).filter((x) => x.local === true)[0]) {
              this.localCentre = Object.values(res).filter((x) => x.local === true)[0];
            } else {
              this.localCentre = {
                id: 0,
                name: '',
                color: 'white',
                latitude: '0.0',
                longitude: '0.0'
              };
            }
            this.initDeck();
          }
        );
      }
    );
  }

  checkLatLonPos(list) {
    /* Check if two centres are close and change label anchor consequently */
    let latitudeWindowCheck: number = 0.5;
    let longitudeWindowCheck: number = 10.0;
    for (var i = 0; i < list.length; i++) {
      if (list[i].hasOwnProperty('textAnchor') == false) {
        list[i]['textAnchor'] = 'end';
      } else {
      }
      for (var k = 0; k < i; k++) {
        if (
          Math.abs(list[i].latitude - list[k].latitude) < latitudeWindowCheck &&
          list[i].longitude - list[k].longitude < longitudeWindowCheck
        ) {
          list[i].textAnchor = 'start';
        }
      }
    }
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

  /* Deck.gl with Mapbox interleaved */
  initDeck() {
    document.getElementById('map-content').innerHTML = "";

    let lineCol = 60;
    //const bounds = [[-180, -85], [180, 85]];
    const bounds = [[-170, -80], [170, 80]];

    function applyViewStateConstraints(viewState: any) {
      return {
        ...viewState,
        longitude: Math.min(bounds[1][0], Math.max(bounds[0][0], viewState.longitude)),
        latitude: Math.min(bounds[1][1], Math.max(bounds[0][1], viewState.latitude))
      };
    }

    const geoJsonLayer = new GeoJsonLayer({
      id: 'GeoJsonLayer',
      data: '../assets/world-countries.geojson',

      stroked: true,
      filled: true,
      pickable: true,
      getFillColor: [0, 0, 0], 
      getLineColor: [lineCol, lineCol, lineCol],
      lineWidthUnits: 'pixels',
      getLineWidth: 1
    });

    const iconLayer = new IconLayer({
      id: 'icon-layer',
      data: this.allCentreList,
      pickable: true,
      billboard: true, // false = flat on terrain, true = vertical
      getIcon: (d:any) => ({
        url: this.ICON_MAPPING[d.icon],
        width: 64,
        height: 64,
        anchorY: 64,
        mask: true
      }),
      parameters: {
        depthTest: false
      },
      getPosition: (d:any) => [d.longitude, d.latitude, 0],
      getSize: AppConfig.settings.mapSettings.iconSize,
      getColor: (d:any) => this.rgbConvertToArray(d.color)
    });

    const textLayer = new TextLayer({
      id: 'text-layer',
      data: this.allCentreList,
      fontFamily: '"NotesESA-Reg", Arial, Helvetica, sans-serif',
      pickable: true,
      parameters: {
        depthTest: false
      },
      getPosition: (d:any) => [d.longitude, d.latitude],
      getText: (d:any) => d.name,
      getSize: AppConfig.settings.mapSettings.textSize,
      sizeUnits: 'pixels',
      getPixelOffset: (d:any) => (d.textAnchor == 'end' ? [-20, -6] : [20, -6]),
      getAngle: 0,
      getColor: [255, 255, 255],
      getTextAnchor: (d:any) => d.textAnchor,
      getAlignmentBaseline: 'bottom'
    });

    const arcLayer = new ArcLayer({
      id: 'arcs-layer',
      data: this.data_source,
      getSourcePosition: [this.localCentre.longitude, this.localCentre.latitude],
      getTargetPosition: (d:any) => [d.longitude, d.latitude],
      getSourceColor: this.mapType == 'dhsConnected' ? this.rgbConvertToArray(this.localCentre.color) : d => this.rgbConvertToArray(d.color),
      getTargetColor: this.mapType == 'dhsConnected' ? this.rgbConvertToArray(this.localCentre.color) : d => this.rgbConvertToArray(d.color),
      getWidth: 1
    });

    const deckInstance = new Deck({
      parent: <HTMLDivElement>document.getElementById('map-content'),
      initialViewState: this.INITIAL_VIEW_STATE,
      controller: true,
      views: new MapView({repeat: false}),
      //getTooltip: ({object}) => object && object.properties.name,
      layers: [geoJsonLayer, iconLayer, textLayer, arcLayer],
      onViewStateChange: ({viewState}) => applyViewStateConstraints(viewState)
    });

    /* this.map.on('load', () => {
      if (this.map.getLayer('icon-layer')) this.map.removeLayer('icon-layer');
      if (this.map.getLayer('text-layer')) this.map.removeLayer('text-layer');
      if (this.map.getLayer('arcs-layer')) this.map.removeLayer('arcs-layer');

      this.map.addLayer(iconLayer);
      this.map.addLayer(textLayer);
      this.showArcs ? this.map.addLayer(arcLayer) : {};
      /* uncomment to show nav controls 
      // this.map.addControl(nav, 'top-right');

      this.pageRefreshed = false;
      if (this.sub) {
        this.sub.unsubscribe();
      }
    });

    this.map.on('resize', () => {
    });
     */
  }

  /* Function to convert [r, g, b] colors to html string: "#rrggbb" */
  rgbConvertToString(col: [number, number, number]) {
    let color: string = "#" + col[0].toString(16).padStart(2, '0') + col[1].toString(16).padStart(2, '0') + col[2].toString(16).padStart(2, '0');
    return color;
  }

  /* Function to convert #rrggbb colors to array: [r, g, b] */
  rgbConvertToArray(col: string) {
    if (col.length != 7) {
      return [100, 200, 250];
    }
    if (col.charAt(0) != '#') return [200, 0, 0];
    var r = parseInt(col.substr(1, 2), 16);
    var g = parseInt(col.substr(3, 2), 16);
    var b = parseInt(col.substr(5, 2), 16);
    let color = [r, g, b];
    return color;
  }
} 
