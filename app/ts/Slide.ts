import {Config} from './config';
import {Component} from 'angular2/core';

@Component({
    selector : "slide",
    templateUrl : "app/template/slide.html",
    inputs : [
        'slides'
    ]
})

export class Slide {}