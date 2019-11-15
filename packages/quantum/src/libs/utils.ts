import { HTMLStencilElement } from "@stencil/core/internal";
import { Provider } from "./provider";

//#region Error Stuff

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
        const provider = Provider.find<QuantumError>(el, "quantum-error");
        provider.provide(err);
    } catch(e) {
        throw err;
    }
}

//#endregion

//#region Logging

const _log = (...args: any[]) => (<any>_log).debug && console.log(...args);
(<any>_log).debug = false;

export const log = _log as typeof _log & {debug: boolean};

export const nop = () => {};

//#endregion

//#region Provider Dom Stuff


//#endregion

//#region Stencil Component Hooking

export interface ComponentPrototype {
    el: HTMLStencilElement;
    componentWillLoad?: (...args: any[]) => Promise<void>|void;
    componentDidLoad?: (...args: any[]) => Promise<void>|void;
    [key: string]: any;
};

export type ComponentDecorator<K extends string> = (prototype: ComponentPrototype, propertyKey: K) => any;


type Callback = (obj: any) => Promise<void>|void;
export function hookComponent<K extends keyof ComponentPrototype>(prototype: ComponentPrototype, key: K, cb: (obj: any) => Promise<Callback|void>|Callback|void)
{
    const _original = prototype[key] || nop;

    prototype[key] = async function(...args: any[]) {
        log(key, this);
        const cb2 = await cb(this);
        let result = await _original.apply(this, args);
        if (cb2 instanceof Function) await cb2(this);
        return result;
    }
}

export function getEl(component: any): HTMLStencilElement
{
    const el = component?.["el"];
    if (el instanceof Object && typeof el.forceUpdate === "function") {
        return el;
    }
    throw new QuantumError(`Property 'el' required on ${component}`);
}

//#endregion