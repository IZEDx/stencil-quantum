import { Provider } from "./provider";
import { getEl, hookComponent, ComponentPrototype } from "./utils";
import { throwQuantum } from "./error";

export interface BaseOptions
{
    on?: string|symbol;
    namespace?: string;
}

export interface ContextOptions extends BaseOptions 
{
    mutable?: boolean;
}

export function Provide(opts?: ContextOptions) 
{ 
    return function (prototype: ComponentPrototype, propertyName: string)
    {
        const key = opts?.on ?? propertyName;
        let provider: Provider<any>|undefined;
        let defaultValue: any;

        hookComponent(prototype, "componentWillLoad", obj => {
            const el = getEl(obj);
            provider = Provider.create(el, key, defaultValue, opts?.namespace);
            provider.mutable = !!opts?.mutable;

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
                set: (v: any) => { 
                    if (provider) {
                        provider.provide(v);
                    } else {
                        defaultValue = v;
                    }
                },
                enumerable: true,
                configurable: true
            });
        }
    } 
}

export function Context(opts?: ContextOptions) 
{ 
    return function (prototype: ComponentPrototype, propertyName: string)
    {
        const key = opts?.on ?? propertyName;
        let provider: Provider<any>|undefined;
        let defaultValue: any;

        hookComponent(prototype, "componentWillLoad", obj => {
            const el = getEl(obj);

            try {
                provider = Provider.find(el, key, opts?.namespace);
                provider.hook(el);
            } catch(err) {
            }

            return () => {
                try {
                    if (!provider) {
                        provider = Provider.find(el, key, opts?.namespace);
                        provider.hook(el);
                    }
                } catch(err) {
                    throwQuantum(el, err);
                }
            }
        });

        if (delete prototype[propertyName]) 
        {
            Object.defineProperty(prototype, propertyName, 
            {
                get: () => provider?.retrieve() ?? defaultValue,
                set: v => {
                    if (opts?.mutable && provider?.mutable) {
                        provider.provide(v);
                    } else {
                        defaultValue = v;
                    }
                },
                enumerable: true,
                configurable: true
            });
        }
    } 
}

export function Observe(opts?: BaseOptions) 
{ 
    return function (prototype: ComponentPrototype, propertyName: string, propertyDesciptor: PropertyDescriptor): PropertyDescriptor
    {
        const method = propertyDesciptor.value;

        hookComponent(prototype, "componentWillLoad", obj => 
        {
            const el = getEl(obj);
            let unlisten = () => {};

            const hookProvider = () => 
            {
                const provider = Provider.find(el, opts?.on ?? propertyName, opts?.namespace);
                unlisten = provider.listen(v => 
                { 
                    try {
                        method.apply(obj, [v]);
                    } catch(err) {
                        throwQuantum(el, err);
                    }
                });
            }

            try {
                hookProvider();
            } catch(err) {}

            return () => 
            {
                unlisten();
                try {
                    hookProvider();
                } catch(err) {
                    throwQuantum(el, err);
                }
            }
        });

        return propertyDesciptor;
    } 
}

export interface ReactOptions {
    on: string;
    provide?: string;
    namespace?: string;
    mutable?: boolean;
}

/**
 * Watch a context 
 * @param {ReactOptions} opts 
 */
export function React(opts: ReactOptions) 
{ 
    return function (prototype: ComponentPrototype, propertyName: string, propertyDesciptor: PropertyDescriptor): PropertyDescriptor
    {
        const method = propertyDesciptor.value;

        hookComponent(prototype, "componentWillLoad", obj => 
        {
            const el = getEl(obj);
            let unlisten = () => {};
            const resultProvider = Provider.create(el, opts.provide ?? propertyName, undefined, opts.namespace);
            resultProvider.mutable = !!opts.mutable;

            const hookProvider = () => 
            {
                const provider = Provider.find(el, opts.on);
                unlisten = provider.listen(v => 
                { 
                    try {
                        const result = method.apply(obj, [v]);
                        if (resultProvider) resultProvider.provide(result);
                    } catch(err) {
                        throwQuantum(el, err);
                    }
                });
            }

            let retry = false;
            try {
                hookProvider();
            } catch(err) {
                retry = true;
            }

            return () => 
            {
                if (retry)
                {
                    unlisten();
                    try {
                        hookProvider();
                    } catch(err) {
                        throwQuantum(el, err);
                    }
                }
            }
        });

        return propertyDesciptor;
    } 
}
