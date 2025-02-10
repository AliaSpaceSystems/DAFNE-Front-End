import { Component, Injectable, OnInit, AfterViewInit } from '@angular/core';

//declare var $: any;

@Injectable({
    providedIn: 'root'
})
@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss']
})
export class ToastComponent implements OnInit, AfterViewInit {

  public title: string;
  public message: string;
  public icon: string;
  private toastEl: HTMLElement;

  constructor() {
    this.icon = 'assets/images/info.svg';
    this.title = 'test';
    this.message = 'test message';
  }

  ngOnInit() {
    this.toastEl = document.querySelector('#portal-toast');
    
    /* this.toastEl.addEventListener('hidden.bs.toast', () => {
      this.toastEl.style.pointerEvents = 'none';
    }) */

    // $('#portal-toast').on('hidden.bs.toast', function () {
    //   this.toastEl.style.pointerEvents = 'none';
    // })
  }

  ngAfterViewInit(): void {
    window.onclick = function (event: any) {
      if (!event.target.matches('.toast')) {
        if(this.toastEl.style.display !== 'none')
          this.toastEl.style.display = 'hide';
      }
    };
  }

  showInfoToast(title: string, message: string) {
    this.icon = 'assets/images/info.svg';
    this.showToast(title, message);
  }

  showSuccessToast(title: string, message: string) {
    this.icon = 'assets/images/success.svg';
    this.showToast(title, message);
  }

  showWarningToast(title: string, message: string) {
    this.icon = 'assets/images/warning.svg';
    this.showToast(title, message);
  }

  showErrorToast(title: string, message: string) {
    this.icon = 'assets/images/error.svg';
    this.showToast(title, message);
  }

  showToast(title: string, message: string) {
    this.title = title;
    this.message = message;
    //$('.toast-icon').attr('src',this.icon);
    //$('.toast-title').html(this.title);
    //$('.toast-body').html(this.message);
    (<HTMLImageElement>this.toastEl.querySelector('.toast-icon')).src = this.icon;
    (<HTMLElement>this.toastEl.querySelector('.toast-title')).innerHTML = this.title;
    (<HTMLElement>this.toastEl.querySelector('.toast-body')).innerHTML = this.message;
    this.toastEl.style.pointerEvents = 'all';
    this.toastEl.style.display = 'show';
  }

}
