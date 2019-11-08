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
    componentWillLoad?: Function;
    [key: string]: any;
};

export function hookComponent(prototype: ComponentPrototype, willLoad: (obj: any) => void)
{
    const _componentWillLoad = prototype["componentWillLoad"] || nop;

    prototype["componentWillLoad"] = function(...args: any[]) {
        log("Will load", this);
        willLoad(this);
        return _componentWillLoad.apply(this, args);
    }
}