import { Component, h, Prop, Watch } from '@stencil/core';
import { createProvider } from '../../context';
import { Provider } from '../../provider';
import StackTrace from "stacktrace-js";


@Component({
    tag: 'ctx-provider'
})
export class CtxProvider 
{
    @Prop({reflectToAttr: true}) name: string;
    @Prop({reflectToAttr: true}) value: any;

    provider!: Provider<any>;

    async componentWillLoad()
    {
        console.log("------------- PROVIDER START", this.name, this.value);
        console.log(await StackTrace.get());
        this.provider = createProvider(this, this.name, this.value);
    }

    async componentDidLoad()
    {
        console.log("------------- PROVIDER END", this.name, this.value);
        console.log(await StackTrace.get());
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
