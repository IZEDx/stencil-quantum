import { Component, h, Prop, Watch, Element } from '@stencil/core';
import { createProvider } from '../../context';
import { Provider } from '../../provider';


@Component({
    tag: 'ctx-provider'
})
export class CtxProvider 
{
    @Element() el: HTMLElement;
    @Prop({reflectToAttr: true}) name: string;
    @Prop() value: any;

    provider!: Provider<any>;

    componentWillLoad()
    {
        this.provider = createProvider(this.el, this.name, this.value);
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
