import { Component, h, Prop, Watch, Element } from '@stencil/core';
import { Provider } from '../../libs/provider';
import { throwQuantum } from '../../libs';

@Component({
    tag: 'quantum-provider'
})
export class QuantumProvider 
{
    @Element() el!: HTMLQuantumProviderElement;

    @Prop({reflect: true}) name!: string;
    @Prop() value: any;

    provider!: Provider<any>;

    componentWillLoad()
    {
        try {
            this.provider = Provider.create(this.el, this.name, this.value);
        } catch(err) {
            throwQuantum(this.el, err);
        }
    }

    @Watch("value")
    onValue(val: any)
    {
        try {
            this.provider.provide(val);
        } catch(err) {
            throwQuantum(this.el, err);
        }
    }

    render() {
        return <slot />;
    }
}
