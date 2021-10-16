import { getElement } from "@stencil/core";
import { throwQuantum } from "../error";
import { Provider } from "../provider";
import { Entanglement } from "../quantum";
import { hookComponent } from "../utils";
import { TypedContextPrototype } from "./prototypes";


export type ImplementDecorator<T extends Entanglement<any>, K extends keyof T["keys"]> 
    = <P extends string>(prototype: TypedContextPrototype<T, K, P>, propertyName: P) => void;

export function Implement<T extends Entanglement<any>, K extends keyof T["keys"]>(config: T, key: K): ImplementDecorator<T, K>
{
    return function <P extends string>(
        prototype: TypedContextPrototype<T, K, P>,
        propertyName: P
    )
    {
        const opts = config?.get(key);
        let defaultValue = prototype[propertyName] || opts?.default;
        delete prototype[propertyName];

        hookComponent(prototype, "componentWillLoad", obj => {
            const el = getElement(obj);
            const provider = Provider.create(el, key as any, defaultValue ?? obj[propertyName], opts?.namespace, opts?.debug);

            try {
                provider.attach(el);
                provider.hook(el);
            } catch(err) {
                throwQuantum(el, err);
            }

            Object.defineProperty(obj, propertyName, 
            {
                get: () => provider.retrieve(),
                set: (v: any) => provider.provide((...args: any) => v.apply(obj, args)),
                enumerable: true,
                configurable: true
            });
    
            hookComponent(prototype, "disconnectedCallback", o => {
                if (o === obj) provider.pause();
            });
    
            hookComponent(prototype, "connectedCallback", o => {
                if (o === obj) provider.pause(false);
            });
        });
    }
}