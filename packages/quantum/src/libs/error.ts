
import { Provider } from "./provider";
import { HTMLStencilElement } from "@stencil/core/internal";
import { ComponentPrototype, hookComponent } from "./utils";
import { getElement } from "@stencil/core";

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

export interface ErrorOptions
{
    namespace?: string;
}

export function Throw(opts?: ErrorOptions) 
{ 
    return function (prototype: ComponentPrototype, propertyName: string)
    {
        let provider: Provider<any>;

        hookComponent(prototype, "componentWillLoad", obj => {
            const el = getElement(obj);
            try {
                provider = Provider.find<QuantumError>(el, $error, opts?.namespace);
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

export function ContextError(opts?: ErrorOptions) 
{ 
    return function (prototype: ComponentPrototype, propertyName: string)
    {
        let provider: Provider<any>|undefined;

        hookComponent(prototype, "componentWillLoad", obj => {
            const el = getElement(obj);
            provider = Provider.create(el, $error, prototype[propertyName], opts?.namespace);

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
                set: (v: any) => provider?.provide(v),
                enumerable: true,
                configurable: true
            });
        }
    }  
}

export interface CatchOptions extends ErrorOptions
{
    provide?: string;
}

export function Catch(opts?: CatchOptions) 
{ 
    return function (prototype: ComponentPrototype, propertyName: string, propertyDesciptor: PropertyDescriptor): PropertyDescriptor
    {
        hookComponent(prototype, "componentWillLoad", obj => {
            const el = getElement(obj);
            const provider = Provider.create(el, $error, undefined, opts?.namespace)
            const responseProvider = opts?.provide ? Provider.create(el, opts.provide, undefined, opts.namespace) : undefined;

            try {
                provider.attach(el);
                responseProvider?.attach(el);
                provider.listen(async v => { 
                    try {
                        const response = await propertyDesciptor.value?.apply(obj, [v]);
                        responseProvider?.provide(response);
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
