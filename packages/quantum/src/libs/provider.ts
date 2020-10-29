import { HTMLStencilElement } from "@stencil/core/internal";
import { forceUpdate } from "@stencil/core";
import { log } from "./utils";
import { QuantumError } from "./error";

const $providers = Symbol.for("stencil-quantum-providers");
export type ProvideCallback<T> = (newvalue: T, oldvalue?: T) => void;

export interface Listener<T>
{
    action: ProvideCallback<T>;
    unlisten: Function;
    paused: boolean;
}

export class Provider<T>
{
    listeners = [] as Listener<T>[];
    hooks = new Map<HTMLStencilElement, Listener<T>>();
    mutable = false;
    paused = false;

    constructor(public readonly key: string|symbol, private value: T, public debug = false)
    {
    }

    pause(paused = true)
    {
        this.paused = paused;
    }

    retrieve = (): T =>
    {
        return this.value;
    }

    provide = (value: T) =>
    {
        if (this.debug) log(`(${String(this.key)}) `, "PROVIDING", value, "to", this.listeners);
        let oldvalue = this.value;
        this.value = value;
        if (!this.paused)
        {
            this.listeners
                .filter(listener => !listener.paused)
                .forEach(listener => listener.action(value, oldvalue));
        }
        return this;
    }

    update = (fn: (v: T) => T) =>
    {
        return this.provide(fn(this.retrieve()));
    }

    listen = (cb: ProvideCallback<T>, updateImmediately = true, el?: HTMLStencilElement) =>
    {
        if (this.debug) log(`(${String(this.key)}) `, "LISTEN", updateImmediately, this, cb);
        const listener: Listener<T> = {
            action: cb,
            unlisten: () => this.unlisten(cb),
            paused: false
        }

        this.listeners = [...this.listeners, listener];
        if (updateImmediately) cb(this.value);

        return listener;
    }

    unlisten = (cb: ProvideCallback<T>) =>
    {
        this.listeners = this.listeners.filter(listener => listener.action !== cb);
    }

    attach = <H extends boolean|undefined>(el: H extends true ? HTMLElement : HTMLStencilElement, noHook?: H) =>
    { 
        if (this.debug) log(`(${String(this.key)}) `, "Add Provider", el, this);

        const providers = Provider.getAttached(el);
        if (!providers.includes(this)) providers.push(this);

        if (this.debug) log(`(${String(this.key)}) `, "Total Providers", el, providers);
        
        return noHook ? this : this.hook(el as any);
    }

    isHooked = (el: HTMLStencilElement) =>
    {
        return this.hooks.has(el);
    }

    getHook = (el: HTMLStencilElement) => this.hooks.get(el);

    hook = (el: HTMLStencilElement) =>
    {
        if (this.debug) log(`(${String(this.key)}) `, "Hook Provider", el, this);
        this.hooks.set(el, this.listen(() => forceUpdate(el)));
        return this;
    }

    pauseHook = (el: HTMLStencilElement, paused = true) =>
    {
        if (this.debug) log(`(${String(this.key)}) `, "Pausing Hook", paused);
        if (this.isHooked(el)) this.getHook(el)!.paused = paused;
    }


    unhook = (el: HTMLStencilElement) =>
    {
        if (this.debug) log(`(${String(this.key)}) `, "Unhook Provider", el, this);
        if (this.isHooked(el)) {
            this.hooks.get(el)?.unlisten();
            this.hooks.delete(el);
        }
        return this;
    }

    destroy = () =>
    {
        this.listeners = [];
        this.hooks = new Map();
    }


    /**
     * Creates a predicate, that filters providers matching a key and having no namespace or being 
     * @param key 
     * @param namespace 
     */
    static makeFilter(key: string|symbol, namespace?: string) 
    {
        return (p: Provider<any>) => p.key === key || (namespace && typeof key === "string" && p.key === namespace + "__" + key);
    } 

    static find<T>(el: HTMLElement, key: string|symbol, namespace?: string, debug?: boolean): Provider<T>
    {
        if (debug) log(`(${String(key)}) `, "Searching Provider", key, namespace,  el);
        const providers = Provider.getAttached(el).filter(Provider.makeFilter(key, namespace));

        if (providers.length > 1) {
            throw new QuantumError(`Found multiple "${String(key)}" providers on the same object!`);
        } else if (providers.length === 1) {
            return providers[0];
        }

        // No provider found on this el, check parent

        let parent = (el.parentElement ?? el.shadowRoot?.host ?? (el.parentNode as ShadowRoot)?.host) as HTMLElement; // parentElement or shadowRoot.host
        if(!parent)
        {
            throw new QuantumError(`No provider in hierarchy found that matches "${String(key)}"!`);
        }
        
        return Provider.find<T>(parent, key, namespace, debug).attach(el, true); // Attach reference to this el to make lookup for children shorter
    }

    static create<T>(el: HTMLStencilElement, key: string|symbol, value: T, namespace?: string, debug?: boolean): Provider<T>
    {
        if (typeof key === "string") key = (namespace ? namespace + "__" : "") + key;
        if (debug) log(`(${String(key)}) `, "Create Provider", el, key, value);
        return new Provider(key, value, debug).attach(el);
    }

    static getAttached(el: HTMLElement): Provider<any>[]
    {
        if (!((<any>el)[$providers] instanceof Array)) {
            (<any>el)[$providers] = [];
        }
        return (<any>el)[$providers];
    }
}
