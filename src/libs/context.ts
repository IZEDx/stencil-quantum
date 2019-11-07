import { Provider } from "./provider";
import { HTMLStencilElement } from "@stencil/core/internal";
import { nop } from "./utils";

class ContextError extends Error {}
const $providers = Symbol.for("stencil-quantum-providers");
export const debug = false;
const log = (...args: any[]) => debug && console.log(...args);

export interface ComponentPrototype {
    el: HTMLStencilElement;
    componentWillLoad?: Function;
    [key: string]: any;
};

export function Provide(key?: string|symbol) 
{ 
    return function (prototype: ComponentPrototype, propertyName: string)
    {
        key = key || propertyName;
        const provider = new Provider(key, prototype[propertyName]);

        hookComponent(prototype, obj => {
            const el = getEl(obj);
            addProvider(el, provider);
            hookProvider(el, provider);
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

export function Context(key?: string) 
{ 
    return function (prototype: ComponentPrototype, propertyName: string)
    {
        key = key || propertyName;
        let provider: Provider<any>;

        hookComponent(prototype, obj => {
            const el = getEl(obj);
            provider = findProvider(el, key!);
            hookProvider(el, provider);
        });

        if (delete prototype[propertyName]) 
        {
            Object.defineProperty(prototype, propertyName, 
            {
                get: () => provider && provider.retrieve(),
                enumerable: true,
                configurable: true
            });
        }
    } 
}

function hookComponent(prototype: ComponentPrototype, willLoad: (obj: any) => void)
{
    const _componentWillLoad = prototype["componentWillLoad"] || nop;

    prototype["componentWillLoad"] = function(...args: any[]) {
        log("Will load", this);
        willLoad(this);
        return _componentWillLoad.apply(this, args);
    }
}

export function createProvider<T>(el: HTMLStencilElement, key: string|symbol, value: T): Provider<T>
{
    log("Create Provider", el, key, value);
    const provider = new Provider(key, value);

    addProvider(el, provider);
    hookProvider(el, provider);

    return provider;
}

export function findProvider<T>(el: HTMLElement, key: string|symbol): Provider<T>
{
    log("Searching Provider", key, el);
    const providers = (<any>el)[$providers] as Provider<any>[];
    log("In Providers", providers);
    if (providers instanceof Array)
    {
        const found = providers.filter(provider => provider.key === key);
        if (found.length > 1) {
            throw new ContextError(`Found multiple providers with key "${String(key)}" on the same object!`);
        } else if (found.length === 1) {
            return found[0];
        }
    } 
    
    if(!el.parentElement)
    {
        throw new ContextError(`No provider in hierarchy found with key "${String(key)}!"`);
    }
    else
    {
        return findProvider(el.parentElement, key);
    }
}

function addProvider(el: HTMLStencilElement, provider: Provider<any>)
{ 
    log("Add Provider", el, provider);
    if (!((<any>el)[$providers] instanceof Array)) {
        (<any>el)[$providers] = [];
    }

    (<any>el)[$providers].push(provider);
    log("Total Providers", el, (<any>el)[$providers]);
}

function hookProvider<T>(el: HTMLStencilElement, provider: Provider<T>)
{
    log("Hook Provider", el, provider);
    provider.listen(() => el.forceUpdate());
}

function getEl(_this: any): HTMLStencilElement
{
    const el = _this && _this["el"];
    if (el instanceof Object && typeof el.forceUpdate === "function") {
        return el;
    }
    throw new ContextError("Property 'el' required!");
}
