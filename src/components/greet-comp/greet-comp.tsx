import { Component, h, Element } from '@stencil/core';

@Component({
    tag: 'greet-comp'
})
export class GreetComp {

    @Element() el: HTMLElement;

    render() {
        return <div>
            Hallo <ctx-consumer name="greeting"></ctx-consumer>
        </div>;
    }
}
