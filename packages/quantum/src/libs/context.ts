import { Provider } from "./provider";
import { getEl, hookComponent } from "./utils";
import { throwQuantum } from "./error";
import { QuantumConfig, ContextType } from "./key";
import { HTMLStencilElement } from "@stencil/core/internal";

export type TypedContextPrototype<T extends QuantumConfig<any>, K extends keyof T["keys"], P extends string> = {
    el: HTMLStencilElement;
    componentWillLoad?: (...args: any[]) => Promise<void>|void;
    componentDidLoad?: (...args: any[]) => Promise<void>|void;
} & { [L in P]: ContextType<T, K> };

export type ProvideDecorator<T extends QuantumConfig<any>, K extends keyof T["keys"]> 
    = <P extends string>(prototype: TypedContextPrototype<T, K, P>, propertyName: P) => void;

export function Provide<T extends QuantumConfig<any>, K extends keyof T["keys"]>(config: T, key: K): ProvideDecorator<T, K>
{ 
    return function <P extends string>(prototype: TypedContextPrototype<T, K, P>, propertyName: P)
    {
        const opts = config?.get(key);
        let provider: Provider<any>|undefined;
        let defaultValue: any;

        hookComponent(prototype, "componentWillLoad", obj => {
            const el = getEl(obj);
            provider = Provider.create(el, key as any, defaultValue, opts?.namespace);
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

export type ContextDecorator<T extends QuantumConfig<any>, K extends keyof T["keys"]> 
    = <P extends string>(prototype: TypedContextPrototype<T, K, P>, propertyName: P) => void;

export function Context<T extends QuantumConfig<any>, K extends keyof T["keys"]>(config: T, key: K): ContextDecorator<T, K>
{ 
    return function <P extends string>(prototype: TypedContextPrototype<T, K, P>, propertyName: P)
    {
        const opts = config?.get(key);
        let provider: Provider<any>|undefined;
        let defaultValue = opts?.default;

        hookComponent(prototype, "componentWillLoad", obj => {
            const el = getEl(obj);

            try {
                provider = Provider.find(el, key as any, opts?.namespace);
                provider.hook(el);
            } catch(err) {
            }

            return () => {
                try {
                    if (!provider) {
                        provider = Provider.find(el, key as any, opts?.namespace);
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


export type TypedObservePrototype<
    T extends QuantumConfig<any>, 
    K extends keyof T["keys"], 
    P extends string
> = {
    el: HTMLStencilElement;
    componentWillLoad?: (...args: any[]) => Promise<void>|void;
    componentDidLoad?: (...args: any[]) => Promise<void>|void;
} & { [L in P]: (val: ContextType<T, K>) => any };

export type ObserveDecorator<T extends QuantumConfig<any>, K extends keyof T["keys"]> 
    = <P extends string>(prototype: TypedObservePrototype<T, K, P>, propertyName: P, desc: PropertyDescriptor) => PropertyDescriptor;
    
export function Observe<T extends QuantumConfig<any>, K extends keyof T["keys"]>(config: T, key: K): ObserveDecorator<T, K>
{ 
    return function <P extends string>(
        prototype: TypedObservePrototype<T, K, P>, 
        propertyName: P, 
        propertyDesciptor: PropertyDescriptor
    ): PropertyDescriptor
    {
        const opts = config?.get(key);
        const method = propertyDesciptor.value;

        hookComponent(prototype, "componentWillLoad", obj => 
        {
            const el = getEl(obj);
            let unlisten = () => {};

            const hookProvider = () => 
            {
                const provider = Provider.find(el, key as any, opts?.namespace);
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

export type TypedReactPrototype<
    T1 extends QuantumConfig<any>, K1 extends keyof T1["keys"], 
    T2 extends QuantumConfig<any>, K2 extends keyof T2["keys"], 
    P extends string
> = {
    el: HTMLStencilElement;
    componentWillLoad?: (...args: any[]) => Promise<void>|void;
    componentDidLoad?: (...args: any[]) => Promise<void>|void;
} & { [L in P]: (val: ContextType<T1, K1>) => ContextType<T2, K2>|Promise<ContextType<T2, K2>> };

export type ReactDecorator<
    T1 extends QuantumConfig<any>, K1 extends keyof T1["keys"],
    T2 extends QuantumConfig<any>, K2 extends keyof T2["keys"]
> 
    = <P extends string>(prototype: TypedReactPrototype<T1, K1, T2, K2, P>, propertyName: P, desc: PropertyDescriptor) => PropertyDescriptor;

export function React<
    T1 extends QuantumConfig<any>, K1 extends keyof T1["keys"],
    T2 extends QuantumConfig<any>, K2 extends keyof T2["keys"]
>(from: T1, fromKey: K1, to: T2, toKey: K2): ReactDecorator<T1, K1, T2, K2>
{ 
    return function <P extends string>(
        prototype: TypedReactPrototype<T1, K1, T2, K2, P>, 
        propertyName: P, 
        propertyDesciptor: PropertyDescriptor
    ): PropertyDescriptor
    {
        const fromOpts = from.get(fromKey);
        const toOpts = to.get(toKey);
        const method = propertyDesciptor.value;

        hookComponent(prototype, "componentWillLoad", obj => 
        {
            const el = getEl(obj);
            let unlisten = () => {};
            const resultProvider = Provider.create(el, toOpts.name, undefined, toOpts.namespace);
            resultProvider.mutable = !!toOpts.mutable;

            const hookProvider = () => 
            {
                const provider = Provider.find(el, fromOpts.name, fromOpts.namespace);
                unlisten = provider.listen(async v => 
                { 
                    try {
                        const result = await method.apply(obj, [v]);
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
