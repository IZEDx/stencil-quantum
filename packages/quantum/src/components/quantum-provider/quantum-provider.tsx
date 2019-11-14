import { Component, h, Prop, Watch, Element } from '@stencil/core';
import { Provider } from '../../libs/provider';

@Component({
    tag: 'quantum-provider'
})
export class QuantumProvider 
{
    @Element() el!: HTMLQuantumProviderElement;

    @Prop({reflectToAttr: true}) name!: string;
    @Prop() value: any;

    provider!: Provider<any>;

    componentWillLoad()
    {
        this.provider = Provider.create(this.el, this.name, this.value);
    }

    @Watch("value")
    onValue(val: any)
    {
        this.provider.provide(val);
    }

    render() {
        return <slot />;
    }
}
