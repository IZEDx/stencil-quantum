import { throwQuantum } from "../error";
import { Provider } from "../provider";
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
            const el = getElement(obj);
            let unlisten = () => {};

            const hookProvider = () => 
            {
                const provider = Provider.find(el, key as any, opts?.namespace);
                unlisten = provider.listen(v => 
                { 
                    try {
                        method.apply(obj, [v]);
                    } catch(err) {
                        throwQuantum(el, err);
                    }
                });
            }

            try {
                hookProvider();
            } catch(err) {}

            return () => 
            {
                unlisten();
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