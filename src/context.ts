import { Provider } from "./provider";
import { HTMLStencilElement } from "@stencil/core/internal";

class ContextError extends Error {}
const $providers = Symbol.for("stencil-quantum-providers");

export function Provide(key?: string|symbol) 
{ 
    return function (prototype: {el: HTMLStencilElement}, propertyName: string)
    {
        key = key || propertyName;
        const provider = new Provider(key, prototype[propertyName]);

        hookComponent(prototype, obj => addProvider(getEl(obj), provider));

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
    return function (prototype: {el: HTMLStencilElement}, propertyName: string)
    {
        key = key || propertyName;
        let provider: Provider<any>;

        hookComponent(prototype, obj => provider = hookProvider(getEl(obj), key));

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

function hookComponent(prototype: Object, willLoad: (obj: any) => void)
{
    const _componentWillLoad = prototype["componentWillLoad"] || nop;

    prototype["componentWillLoad"] = function(...args: any[]) {
        console.log("Will load", this);
        willLoad(this);
        return _componentWillLoad.apply(this, args);
    }
}

export function hookProvider<T>(el: HTMLStencilElement, key: string): Provider<T>
{
    const provider = findProvider<T>(el, key);
    forceUpdate(el, provider);
    return provider;
}

export function findProvider<T>(el: HTMLElement, key: string): Provider<T>
{
    const providers = el[$providers] as Provider<any>[];
    if (providers instanceof Array)
    {
        const found = providers.filter(provider => provider.key === key);
        if (found.length > 1) {
            throw new ContextError(`Found multiple providers with key "${key}" on the same object!`);
        } else if (found.length === 1) {
            return found[0];
        }
    } 
    else if(!el.parentElement)
    {
        throw new ContextError(`No provider in hierarchy found with key "${key}!"`);
    }
    else
    {
        return findProvider(el.parentElement, key);
    }
}

export function createProvider<T>(el: HTMLStencilElement, key: string|symbol, value: T): Provider<T>
{
    const provider = new Provider(key, value);

    addProvider(el, provider);

    return provider;
}

export function addProvider(el: HTMLStencilElement, provider: Provider<any>)
{ 
    if (!(el[$providers] instanceof Array)) {
        el[$providers] = [];
    }

    el[$providers].push(provider);
    forceUpdate(el, provider);
}

export function forceUpdate(el: HTMLStencilElement, provider: Provider<any>)
{
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

/*

const currentFrame = () => contextStack.length === 0 ? undefined : contextStack[contextStack.length - 1];

const pushFrame = (obj: Object) => 
{ 
    let frame = currentFrame();
    if (!frame || frame.obj !== obj) {
        frame = {obj, providers: []};
        contextStack = [...contextStack, frame]; 
        console.log("Push Frame", obj);
    }
    return frame;
}

const popFrame = (obj: Object) => 
{ 
    let frame = currentFrame();
    if (frame && frame.obj === obj) {
        contextStack = contextStack.length === 0 ? [] : contextStack.slice(0, contextStack.length - 1); 
        console.log("Pop Frame", obj);
        return frame;
    }
    return undefined;
}

*/
const nop = () => {};
