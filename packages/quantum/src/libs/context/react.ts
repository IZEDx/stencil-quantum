import { QuantumConfig } from "../key";
import { TypedReactPrototype } from "./prototypes";
import { Provider } from "../provider";
import { getElement } from "@stencil/core";
import { hookComponent } from "../utils";
import { throwQuantum } from "../error";

export type ReactDecorator<
    T1 extends QuantumConfig<any>, K1 extends keyof T1["keys"],
    T2 extends QuantumConfig<any>, K2 extends keyof T2["keys"]
> 
= <P extends string>(prototype: TypedReactPrototype<T1, K1, T2, K2, P>, propertyName: P, desc: PropertyDescriptor) => PropertyDescriptor;

export function React<
    T1 extends QuantumConfig<any>, K1 extends keyof T1["keys"],
    T2 extends QuantumConfig<any>, K2 extends keyof T2["keys"]
>(from: T1, fromKey: K1, to: T2, toKey: K2): ReactDecorator<T1, K1, T2, K2>
{ 
    return function <P extends string>(
        prototype: TypedReactPrototype<T1, K1, T2, K2, P>, 
        propertyName: P, 
        propertyDesciptor: PropertyDescriptor
    ): PropertyDescriptor
    {
        const fromOpts = from.get(fromKey);
        const toOpts = to.get(toKey);
        const method = propertyDesciptor.value;

        hookComponent(prototype, "componentWillLoad", obj => 
        {
            const el = getElement(obj);
            let unlisten = () => {};
            const resultProvider = Provider.create(el, toOpts.name, undefined, toOpts.namespace);
            resultProvider.mutable = !!toOpts.mutable;

            const hookProvider = () => 
            {
                const provider = Provider.find(el, fromOpts.name, fromOpts.namespace);
                unlisten = provider.listen(async v => 
                { 
                    try {
                        const result = await method.apply(obj, [v]);
                        if (resultProvider) resultProvider.provide(result);
                    } catch(err) {
                        throwQuantum(el, err);
                    }
                });
            }

            let retry = false;
            try {
                hookProvider();
            } catch(err) {
                retry = true;
            }

            return () => 
            {
                if (retry)
                {
                    unlisten();
                    try {
                        hookProvider();
                    } catch(err) {
                        throwQuantum(el, err);
                    }
                }
            }
        });

        return propertyDesciptor;
    } 
}
