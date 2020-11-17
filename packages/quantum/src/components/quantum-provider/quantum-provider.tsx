import { Component, h, Prop, Watch, Element } from '@stencil/core';
import { Provider } from '../../libs/provider';
import { QuantumKey, throwQuantum } from '../../libs';

@Component({
    tag: 'quantum-provider'
})
export class QuantumProvider 
{
    @Element() el!: HTMLQuantumProviderElement;

    @Prop() bind?: QuantumKey<any, any>;
    @Prop({reflect: true, mutable: true}) name?: string;
    @Prop({reflect: true, mutable: true}) namespace?: string;
    @Prop({reflect: true, mutable: true}) debug?: boolean;
    @Prop() value: any;

    provider!: Provider<any>;

    componentWillLoad()
    {
        try {
            this.name = this.bind?.name ?? this.name ?? "";
            this.namespace = this.bind?.namespace ?? this.namespace;
            this.debug = this.bind?.debug || this.debug;
            this.provider = Provider.create(this.el, this.name, this.value, this.namespace, this.debug);
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
