import { Component, Element, Prop, State } from '@stencil/core';
import { findProvider } from '../../context';
import StackTrace from "stacktrace-js";

@Component({
    tag: 'ctx-consumer'
})
export class CtxConsumer {

    @Element() el: HTMLElement;
    @Prop() name: string;
    @Prop() mapper = (val: any) => `${val}`;
    @State() value = "";

    async componentWillLoad()
    {
        console.log("------------- CONSUMER START", this.name, this.value);
        console.log(await StackTrace.get());
        const provider = findProvider(this.name);
        this.updateVal(provider.retrieve());
        provider.listen(this.updateVal.bind(this));
    }

    async componentDidLoad()
    {
        console.log("------------- CONSUMER END", this.name, this.value);
        console.log(await StackTrace.get());
    }

    updateVal(val: any)
    {
        this.value = this.mapper(val);
    }

    render() {
        return this.value;
    }
}
