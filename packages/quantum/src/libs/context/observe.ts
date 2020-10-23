import { throwQuantum } from "../error";
import { Provider, Listener } from "../provider";
import { hookComponent } from "../utils";
import { TypedObservePrototype } from "./prototypes";
import { getElement } from "@stencil/core";
import { Entanglement } from "../quantum";

export type ObserveDecorator<T extends Entanglement<any>, K extends keyof T["keys"]> 
    = <P extends string>(prototype: TypedObservePrototype<T, K, P>, propertyName: P, desc: PropertyDescriptor) => PropertyDescriptor;

export function Observe<T extends Entanglement<any>, K extends keyof T["keys"]>(config: T, key: K): ObserveDecorator<T, K>
{ 
    return function <P extends string>(
        prototype: TypedObservePrototype<T, K, P>, 
        propertyName: P, 
        propertyDesciptor: PropertyDescriptor
    ): PropertyDescriptor
    {
        const opts = config?.get(key);
        const method = propertyDesciptor.value;

        hookComponent(prototype, "componentWillLoad", obj => 
        {
            let provider: Provider<any>|undefined;
            let listener: Listener<any>|undefined;

            const el = getElement(obj);

            const hookProvider = () => 
            {
                provider = Provider.find(el, key as any, opts?.namespace);
                listener = provider.listen(v => 
                { 
                    try {
                        method.apply(obj, [v]);
                    } catch(err) {
                        throwQuantum(el, err);
                    }
                });
            }

            hookComponent(prototype, "disconnectedCallback", obj => {
                if (listener) listener!.paused = true;
            });
    
            hookComponent(prototype, "connectedCallback", obj => {
                if (listener) listener!.paused = false;
            });

            try {
                hookProvider();
            } catch(err) {}

            return () => 
            {
                if (provider) return;
                
                listener?.unlisten();
                try {
                    hookProvider();
                } catch(err) {
                    throwQuantum(el, err);
                }
            }
        });


        return propertyDesciptor;
    } 
}