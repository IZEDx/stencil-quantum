import { Component, h, Element } from '@stencil/core';
import {  Context } from '../../context';

@Component({
    tag: 'test-comp'
})
export class TestComp {

    @Element() el: HTMLElement;
    @Context() test: string;

    render() {
        return <div>Test Context: {this.test}</div>;
    }
}
