import {Config} from './config';
import {Component} from 'angular2/core';

@Component({
    selector : "gallery",
    templateUrl : "app/template/gallery.html",
    inputs : [
        'apiUri'
    ]
})

export class Gallery {}