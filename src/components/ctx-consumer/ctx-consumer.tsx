import { Component, Element, Prop, State } from '@stencil/core';
import { findProvider } from '../../context';

@Component({
    tag: 'ctx-consumer'
})
export class CtxConsumer {

    @Element() el: HTMLElement;
    @Prop({reflectToAttr: true}) name: string;
    @Prop() mapper = (val: any) => `${val}`;
    @State() value = "";

    componentWillLoad()
    {
        const provider = findProvider(this.el, this.name);
        this.updateVal(provider.retrieve());
        provider.listen(this.updateVal.bind(this));
    }

    updateVal(val: any)
    {
        this.value = this.mapper(val);
    }

    render() {
        return this.value;
    }
}
