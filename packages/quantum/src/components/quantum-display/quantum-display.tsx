import { Component, Element, Prop, State } from '@stencil/core';
import { Provider } from '../../libs/provider';
import { QuantumKey, throwQuantum } from '../../libs';

@Component({
    tag: 'quantum-display'
})
export class QuantumDisplay {

    @Element() el!: HTMLQuantumDisplayElement;
    
    @Prop() bind!: QuantumKey<any, any>;
    @Prop({reflect: true, mutable: true}) name?: string;
    @Prop({reflect: true, mutable: true}) namespace?: string;
    @Prop({reflect: true, mutable: true}) debug?: boolean;
    @Prop() mapper = (val: any) => `${val}`;
    @State() value!: string;

    async componentWillLoad()
    {
        try {
            this.name = this.bind?.name ?? this.name ?? "";
            this.namespace = this.bind?.namespace ?? this.namespace;
            this.debug = this.bind?.debug || this.debug;
            const provider = Provider.find(this.el, this.name, this.namespace, this.debug);
            provider.listen(val => {
                try {
                    this.value = this.mapper(val)
                } catch(err) {
                    throwQuantum(this.el, err);
                }
            }, true);

        } catch(err) {
            throwQuantum(this.el, err);
        }
    }

    render() {
        return this.value;
    }
}
