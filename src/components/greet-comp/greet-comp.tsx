import { Component, h } from '@stencil/core';

@Component({
    tag: 'greet-comp'
})
export class GreetComp {
    render() {
        return <div>
            Hallo <ctx-consumer name="greeting"></ctx-consumer>
        </div>;
    }
}
