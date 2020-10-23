
import { Provider } from "../provider";
import { hookComponent } from "../utils";
import { throwQuantum } from "../error";
import { getElement } from "@stencil/core";
import { TypedContextPrototype } from "./prototypes";
import { Entanglement } from "../quantum";


export type ContextDecorator<T extends Entanglement<any>, K extends keyof T["keys"]> 
    = <P extends string>(prototype: TypedContextPrototype<T, K, P>, propertyName: P) => void;

    
export function Context<T extends Entanglement<any>, K extends keyof T["keys"]>(config: T, key: K): ContextDecorator<T, K>
{ 
    return function <P extends string>(prototype: TypedContextPrototype<T, K, P>, propertyName: P)
    {
        const opts = config?.get(key);
        let defaultValue = opts?.default;

        hookComponent(prototype, "componentWillLoad", obj => {
            const el = getElement(obj);
            let provider: Provider<any>|undefined;

            try {
                provider = Provider.find(el, key as any, opts?.namespace);
                provider.hook(el);
            } catch(err) {
            }

            hookComponent(prototype, "disconnectedCallback", obj => {
                const el = getElement(obj);
                provider?.pauseHook(el, true);
            });
    
            hookComponent(prototype, "connectedCallback", obj => {
                const el = getElement(obj);
                provider?.pauseHook(el, false);
            });
    
            if (delete prototype[propertyName]) 
            {
                Object.defineProperty(prototype, propertyName, 
                {
                    get: () => provider?.retrieve() ?? defaultValue,
                    set: v => {
    
                        if (opts?.mutable && provider?.mutable) {
                            provider.provide(v);
                        } else {
                            defaultValue = v;
                        }
                    },
                    enumerable: true,
                    configurable: true
                });
            }

            return () => {
                if (provider) return;

                try {
                    provider = Provider.find(el, key as any, opts?.namespace);
                    provider.hook(el);
                } catch(err) {
                    throwQuantum(el, err);
                }
            }
        });
    } 
}
