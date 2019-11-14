import { Component, Element, Prop, State } from '@stencil/core';
import { Provider } from '../../libs/provider';

@Component({
    tag: 'quantum-consumer'
})
export class QuantumConsumer {

    @Element() el!: HTMLQuantumConsumerElement;
    
    @Prop({reflectToAttr: true}) name!: string;
    @Prop() mapper = (val: any) => `${val}`;
    @State() value!: string;

    async componentWillLoad()
    {
        const provider = Provider.find(this.el, this.name);
        provider.listen(val => this.value = this.mapper(val));
    }

    render() {
        return this.value;
    }
}
