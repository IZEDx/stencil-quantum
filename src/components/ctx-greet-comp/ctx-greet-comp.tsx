import { Component, h } from '@stencil/core';

@Component({
    tag: 'ctx-greet-comp'
})
export class CtxGreetComp {
    render() {
        return <div>
            Hallo <ctx-consumer name="greeting"></ctx-consumer>
        </div>;
    }
}
