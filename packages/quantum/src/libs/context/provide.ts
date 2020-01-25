import { TypedContextPrototype } from "./prototypes";
import { Provider } from "../provider";
import { getElement } from "@stencil/core";
import { hookComponent } from "../utils";
import { throwQuantum } from "../error";
import { Entanglement } from "../quantum";

export type ProvideDecorator<T extends Entanglement<any>, K extends keyof T["keys"]> 
    = <P extends string>(prototype: TypedContextPrototype<T, K, P>, propertyName: P) => void;

export function Provide<T extends Entanglement<any>, K extends keyof T["keys"]>(config: T, key: K): ProvideDecorator<T, K>
{ 
    return function <P extends string>(prototype: TypedContextPrototype<T, K, P>, propertyName: P)
    {
        const opts = config?.get(key);
        let provider: Provider<any>|undefined;
        let defaultValue: any;

        hookComponent(prototype, "componentWillLoad", obj => {
            const el = getElement(obj);
            provider = Provider.create(el, key as any, defaultValue, opts?.namespace);
            provider.mutable = !!opts?.mutable;

            try {
                provider.attach(el);
                provider.hook(el);
            } catch(err) {
                throwQuantum(el, err);
            }
        });

        if (delete prototype[propertyName]) 
        {
            Object.defineProperty(prototype, propertyName, 
            {
                get: () => provider?.retrieve(),
                set: (v: any) => { 
                    if (provider) {
                        provider.provide(v);
                    } else {
                        defaultValue = v;
                    }
                },
                enumerable: true,
                configurable: true
            });
        }
    } 
}