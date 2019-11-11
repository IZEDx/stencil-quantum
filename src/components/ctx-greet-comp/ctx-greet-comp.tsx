import { Component, h, Element } from '@stencil/core';
import { WatchContext } from '../../libs/context';

@Component({
    tag: 'ctx-greet-comp'
})
export class CtxGreetComp 
{
    @Element() el!: HTMLCtxGreetCompElement;

    @WatchContext()
    greeting(v: string) {
        console.log("New greeting", v);
    }

    render() {
        return <div>
            Hallo <ctx-consumer name="greeting"></ctx-consumer>
        </div>;
    }
}
