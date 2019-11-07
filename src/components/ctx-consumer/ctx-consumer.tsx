import { Component, Element, Prop, State } from '@stencil/core';
import { findProvider } from '../../libs/context';

@Component({
    tag: 'ctx-consumer'
})
export class CtxConsumer {

    @Element() el!: HTMLCtxConsumerElement;
    
    @Prop({reflectToAttr: true}) name!: string;
    @Prop() mapper = (val: any) => `${val}`;
    @State() value!: string;

    componentWillLoad()
    {
        const provider = findProvider(this.el, this.name);
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
