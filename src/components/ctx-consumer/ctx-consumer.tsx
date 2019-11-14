import { Component, Element, Prop, State } from '@stencil/core';
import { Provider } from '../../libs/provider';

@Component({
    tag: 'ctx-consumer'
})
export class CtxConsumer {

    @Element() el!: HTMLCtxConsumerElement;
    
    @Prop({reflectToAttr: true}) name!: string;
    @Prop() mapper = (val: any) => `${val}`;
    @State() value!: string;

    async componentDidLoad()
    {
        const provider = Provider.find(this.el, this.name);
        provider.listen(val => this.value = this.mapper(val));
    }

    render() {
        return this.value;
    }
}
