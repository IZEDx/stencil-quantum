import { HTMLStencilElement } from "@stencil/core/internal";
import { log, QuantumError } from "./utils";

const $providers = Symbol.for("stencil-quantum-providers");
export type ProvideCallback<T> = (value: T) => void;

export class Provider<T>
{
    listeners = [] as ProvideCallback<T>[];
    hooks = new Map<HTMLStencilElement, Function>();

    constructor(public readonly key: string|symbol, private value: T)
    {
        this.retrieve = this.retrieve.bind(this);
        this.provide = this.provide.bind(this);
        this.listen = this.listen.bind(this);
    }

    retrieve(): T
    {
        return this.value;
    }

    provide(value: T)
    {
        this.value = value;
        this.listeners.forEach(cb => cb(value));
    }

    update(fn: (v: T) => T)
    {
        this.provide(fn(this.retrieve()));
    }

    listen(cb: ProvideCallback<T>)
    {
        this.listeners = [...this.listeners, cb];
        cb(this.value);
        return () => {
            this.listeners = this.listeners.filter(_cb => _cb !== cb);
        }
    }

    attach<H extends boolean|undefined>(el: H extends true ? HTMLElement : HTMLStencilElement, noHook?: H)
    { 
        log("Add Provider", el, this);
        if (!((<any>el)[$providers] instanceof Array)) {
            (<any>el)[$providers] = [];
        }

        (<any>el)[$providers].push(this);
        log("Total Providers", el, (<any>el)[$providers]);
        
        if (!noHook) this.hook(el as any);
    }

    isHooked(el: HTMLStencilElement)
    {
        return this.hooks.has(el);
    }

    hook(el: HTMLStencilElement)
    {
        log("Hook Provider", el, this);
        this.hooks.set(el, this.listen(() => el.forceUpdate()));
    }

    unhook(el: HTMLStencilElement)
    {
        log("Unhook Provider", el, this);
        if (this.isHooked(el)) {
            this.hooks.get(el)!();
            this.hooks.delete(el);
        }
    }
    
    static find<T>(el: HTMLElement, key: string|symbol): Provider<T>
    {
        log("Searching Provider", key, el);
        const providers = (<any>el)[$providers] as Provider<any>[];
        log("In Providers", providers);
        if (providers instanceof Array)
        {
            const found = providers.filter(provider => provider.key === key);
            if (found.length > 1) {
                throw new QuantumError(`Found multiple "${String(key)}" providers on the same object!`);
            } else if (found.length === 1) {
                return found[0];
            }
        } 
        
        if(!el.parentElement)
        {
            throw new QuantumError(`No provider in hierarchy found that matches "${String(key)}"!`);
        }
        else
        {
            const provider = Provider.find<T>(el.parentElement, key);
            provider.attach(el, true);
            return provider;
        }
    }

    static create<T>(el: HTMLStencilElement, key: string|symbol, value: T): Provider<T>
    {
        log("Create Provider", el, key, value);
        const provider = new Provider(key, value);
    
        provider.attach(el);
    
        return provider;
    }
}
