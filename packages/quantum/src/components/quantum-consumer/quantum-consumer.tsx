import { Component, Element, Prop, State } from '@stencil/core';
import { Provider } from '../../libs/provider';
import { throwQuantum } from '../../libs';

@Component({
    tag: 'quantum-consumer'
})
export class QuantumConsumer {

    @Element() el!: HTMLQuantumConsumerElement;
    
    @Prop({reflect: true}) name!: string;
    @Prop() mapper = (val: any) => `${val}`;
    @State() value!: string;

    async componentWillLoad()
    {
        try {
            const provider = Provider.find(this.el, this.name);
            provider.listen(val => {
                try {
                    this.value = this.mapper(val)
                } catch(err) {
                    throwQuantum(this.el, err);
                }
            });
        } catch(err) {
            throwQuantum(this.el, err);
        }
    }

    render() {
        return this.value;
    }
}
