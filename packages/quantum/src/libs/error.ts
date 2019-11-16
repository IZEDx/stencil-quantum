
import { Provider } from "./provider";
import { HTMLStencilElement } from "@stencil/core/internal";
import { ComponentPrototype, hookComponent, getEl } from "./utils";

const $error = Symbol.for("stencil-quantum-error");

export class QuantumError extends Error 
{
    constructor(err: Error|string, public target?: HTMLStencilElement)
    {
        super(err instanceof Error ? err.message : err);
        if (err instanceof Error) Object.assign(this, err);
    }
}

export function throwQuantum(el: HTMLStencilElement, error: string|Error)
{
    const err = new QuantumError(error, el);
    console.error(err);
    try {
        const provider = Provider.find<QuantumError>(el, $error);
        provider.provide(err);
    } catch(e) {
        throw err;
    }
}

export function Throw() 
{ 
    return function (prototype: ComponentPrototype, propertyName: string)
    {
        let provider: Provider<any>;

        hookComponent(prototype, "componentWillLoad", obj => {
            const el = getEl(obj);
            try {
                provider = Provider.find<QuantumError>(el, $error);
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
                set: (v) => provider?.provide(v),
                enumerable: true,
                configurable: true
            });
        }
    } 
}

export function ContextError() 
{ 
    return function (prototype: ComponentPrototype, propertyName: string)
    {
        const provider = new Provider($error, prototype[propertyName]);

        hookComponent(prototype, "componentWillLoad", obj => {
            const el = getEl(obj);
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
                get: provider.retrieve,
                set: provider.provide,
                enumerable: true,
                configurable: true
            });
        }
    } 
}

export function Catch() 
{ 
    return function (prototype: ComponentPrototype, propertyName: string, propertyDesciptor: PropertyDescriptor): PropertyDescriptor
    {
        const method = propertyDesciptor.value;
        const provider = new Provider($error, prototype[propertyName]);

        hookComponent(prototype, "componentWillLoad", obj => {
            const el = getEl(obj);

            try {
                provider.attach(el);
                provider.listen(v => { 
                    try {
                        return method.apply(obj, [v]);
                    } catch(err) {
                        throwQuantum(el, err);
                    }
                });
            } catch(err) {
                throwQuantum(el, err);
            }
        });

        return propertyDesciptor;
    } 
}
