import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { fromEvent } from 'rxjs';
import { filter, map, distinctUntilChanged } from 'rxjs/operators';

const getMaxresThumbnailUrl = (videoUrl: string) => {
  return videoUrl
    .replace('www.youtube', 'i.ytimg')
    .replace('watch?v=', 'vi/')
    .concat('/maxresdefault.jpg');
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild('form') form: ElementRef<HTMLFormElement>;
  formGroup: FormGroup;
  loading = false;
  image$: Promise<string>;
  constructor(
    private formBuilder: FormBuilder,
  ){}

  ngOnInit() {
    this.buildForm();
  }
  ngAfterViewInit() {
    this.setupSubmitListener();
  }

  private setupSubmitListener() {
    const url$ = fromEvent(this.form.nativeElement, 'submit').pipe(
      filter(() => this.formGroup.valid),
      map(() => this.formGroup.value.url),
      map(getMaxresThumbnailUrl),
      distinctUntilChanged(),
    );

    url$.subscribe(url => {
      this.loading = true;
      const img = new Image();
      img.src = url;
      img.onload = () => {
        this.image$ = Promise.resolve(url);
        this.loading = false;
      }
    })
  }

  private buildForm() {
    this.formGroup = this.formBuilder.group({
      url: [null, Validators.required]
    });
  }

}
