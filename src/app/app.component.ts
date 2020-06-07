import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { catchError, distinctUntilChanged, filter, map, startWith, switchMap } from 'rxjs/operators';

import { GetThumbsEvent } from './models';
import { getThumbs, parseUrl } from './util';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  formGroup: FormGroup;
  thumbsEvent$: Observable<GetThumbsEvent>;
  constructor(
    private formBuilder: FormBuilder,
  ) { }


  ngOnInit() {
    this.buildForm();
    this.thumbsEvent$ = this.getValueChangesObservable();
  }

  onClickPaste() {
    navigator.clipboard.readText().then(
      result => this.formGroup.patchValue({ url: result }),
      reject => console.log('Too bad...')
    );
  }

  private buildForm() {
    this.formGroup = this.formBuilder.group({
      url: null
    });
  }

  private getValueChangesObservable(): Observable<GetThumbsEvent> {
    return this.formGroup.get('url').valueChanges.pipe(
      filter(value => value),
      map(parseUrl),
      distinctUntilChanged(),
      switchMap(getThumbs),
      catchError(err => this.handleValueChangesError(err)),
    );
  }

  private handleValueChangesError(err: Error): Observable<GetThumbsEvent> {
    const errorEvent: GetThumbsEvent = { type: 2, errorMessage: err.message };
    return this.getValueChangesObservable().pipe(
      startWith(errorEvent)
    );
  }
}
