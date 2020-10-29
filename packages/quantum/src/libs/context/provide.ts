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
        let defaultValue = prototype[propertyName] || opts?.default;
        delete prototype[propertyName];

        hookComponent(prototype, "componentWillLoad", obj => {
            const el = getElement(obj);
            const provider = Provider.create(el, key as any, defaultValue ?? obj[propertyName], opts?.namespace, opts?.debug);
            provider.mutable = !!opts?.mutable;

            try {
                provider.attach(el);
                provider.hook(el);
            } catch(err) {
                throwQuantum(el, err);
            }

            Object.defineProperty(obj, propertyName, 
            {
                get: () => provider.retrieve(),
                set: (v: any) => provider.provide(v),
                enumerable: true,
                configurable: true
            });
    
            hookComponent(prototype, "disconnectedCallback", obj => {
                provider.pause();
            });
    
            hookComponent(prototype, "connectedCallback", obj => {
                provider.pause(false);
            });
        });
    } 
}