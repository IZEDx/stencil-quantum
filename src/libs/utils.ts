import { HTMLStencilElement } from "@stencil/core/internal";

export class QuantumError extends Error {}

const _log = (...args: any[]) => (<any>_log).debug && console.log(...args);
(<any>_log).debug = false;

export const log = _log as typeof _log & {debug: boolean};

export const nop = () => {};

export function getEl(_this: any): HTMLStencilElement
{
    const el = _this && _this["el"];
    if (el instanceof Object && typeof el.forceUpdate === "function") {
        return el;
    }
    throw new QuantumError("Property 'el' required!");
}

export interface ComponentPrototype {
    el: HTMLStencilElement;
    componentWillLoad?: (...args: any[]) => Promise<void>|void;
    componentDidLoad?: (...args: any[]) => Promise<void>|void;
    [key: string]: any;
};

export type ComponentDecorator<K extends string> = (prototype: ComponentPrototype, propertyKey: K) => any;

export function hookComponent<K extends keyof ComponentPrototype>(prototype: ComponentPrototype, key: K, cb: (obj: any) => Promise<void>|void)
{
    const _original = prototype[key] || nop;

    prototype[key] = async function(...args: any[]) {
        log(key, this);
        await cb(this);
        return _original.apply(this, args);
    }
}