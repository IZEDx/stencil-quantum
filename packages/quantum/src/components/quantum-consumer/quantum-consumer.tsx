import { h, Component, Element, Event, EventEmitter, Prop } from '@stencil/core';
import { Provider } from '../../libs/provider';
import { QuantumKey, throwQuantum } from '../../libs';

@Component({
    tag: 'quantum-consumer'
})
export class QuantumConsumer {

    @Element() el!: HTMLQuantumConsumerElement;
    @Event() update!: EventEmitter<{value: any, provider: Provider<any>}>;
    
    @Prop() bind!: QuantumKey<any, any>;
    @Prop({reflect: true, mutable: true}) name?: string;
    @Prop({reflect: true, mutable: true}) namespace?: string;
    @Prop({reflect: true, mutable: true}) debug?: boolean;

    async componentWillLoad()
    {
        try {
            this.name = this.bind?.name ?? this.name ?? "";
            this.namespace = this.bind?.namespace ?? this.namespace;
            this.debug = this.bind?.debug || this.debug;
            const provider = Provider.find(this.el, this.name, this.namespace, this.debug);
            provider.listen(val => {
                try {
                    this.update.emit({
                        value: val,
                        provider
                    });
                } catch(err) {
                    throwQuantum(this.el, err);
                }
            }, true);
        } catch(err) {
            throwQuantum(this.el, err);
        }
    }

    render() {
        return <slot />;
    }
}
