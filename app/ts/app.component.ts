import {Component} from 'angular2/core';
import {Config} from './config';
import {Slide} from './slide';
import {Gallery} from './gallery';

@Component({
    selector: 'my-app',
    template: '<h1>{{ title }}</h1>',
    directives : [Slide, Gallery]
})

export class AppComponent {
    title:string = Config.SITE_NAME;
    apiUri:string = Config.API;

    constructor() {

    }
}
