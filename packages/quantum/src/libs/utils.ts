//#region Logging

const _log = (...args: any[]) => (<any>_log).debug && console.log(...args);
(<any>_log).debug = false;

export const log = _log as typeof _log & {debug: boolean};

export const nop = () => {};

//#endregion

//#region Stencil Component Hooking

export interface ComponentPrototype {
    componentWillLoad?: (...args: any[]) => Promise<void>|void;
    componentDidLoad?: (...args: any[]) => Promise<void>|void;
    [key: string]: any;
};

export type ComponentDecorator<K extends string> = (prototype: ComponentPrototype, propertyKey: K) => any;


type Callback = (obj: any) => Promise<void>|void;
export function hookComponent<K extends keyof ComponentPrototype>(prototype: ComponentPrototype, key: K, cb: (obj: any) => Promise<Callback|void>|Callback|void)
{
    const _original: any = prototype[key] || nop;

    prototype[key] = async function(...args: any[]) {
        log(key, this);
        const cb2 = await cb(this);
        let result = await _original.apply(this, args);
        if (cb2 instanceof Function) await cb2(this);
        return result;
    }

    return () => {
        prototype[key] = _original;
    }
}

//#endregion