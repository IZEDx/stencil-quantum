import { HTMLStencilElement } from "@stencil/core/internal";
import { log } from "./utils";
import { QuantumError } from "./error";

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
        return this;
    }

    update(fn: (v: T) => T)
    {
        return this.provide(fn(this.retrieve()));
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

        const providers = Provider.getAttached(el);
        if (!providers.includes(this)) providers.push(this);

        log("Total Providers", el, providers);
        
        return noHook ? this : this.hook(el as any);
    }

    isHooked(el: HTMLStencilElement)
    {
        return this.hooks.has(el);
    }

    hook(el: HTMLStencilElement)
    {
        log("Hook Provider", el, this);
        this.hooks.set(el, this.listen(() => el.forceUpdate()));
        return this;
    }

    unhook(el: HTMLStencilElement)
    {
        log("Unhook Provider", el, this);
        if (this.isHooked(el)) {
            this.hooks.get(el)!();
            this.hooks.delete(el);
        }
        return this;
    }
    
    static find<T>(el: HTMLElement, key: string|symbol): Provider<T>
    {
        log("Searching Provider", key, el);
        const providers = Provider.getAttached(el).filter(p => p.key === key);

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
        
        return Provider.find<T>(parent, key).attach(el, true); // Attach reference to this el to make lookup for children shorter
    }

    static create<T>(el: HTMLStencilElement, key: string|symbol, value: T): Provider<T>
    {
        log("Create Provider", el, key, value);
        return new Provider(key, value).attach(el);
    }

    static getAttached(el: HTMLElement): Provider<any>[]
    {
        if (!((<any>el)[$providers] instanceof Array)) {
            (<any>el)[$providers] = [];
        }
        return (<any>el)[$providers];
    }
}
