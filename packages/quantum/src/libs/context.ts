import { Provider } from "./provider";
import { getEl, hookComponent, ComponentPrototype, throwQuantum } from "./utils";

export function Provide(key?: string|symbol) 
{ 
    return function (prototype: ComponentPrototype, propertyName: string)
    {
        key = key || propertyName;
        const provider = new Provider(key, prototype[propertyName]);

        hookComponent(prototype, "componentWillLoad", obj => {
            const el = getEl(obj);
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
    return function (prototype: ComponentPrototype, propertyName: string)
    {
        key = key || propertyName;
        let provider: Provider<any>;
        let defaultValue: any;

        hookComponent(prototype, "componentWillLoad", obj => {
            const el = getEl(obj);

            try {
                provider = Provider.find(el, key!);
                provider.hook(el);
            } catch(err) {
            }

            return () => {
                try {
                    if (provider) provider.unhook(el);
                    provider = Provider.find(el, key!);
                    provider.hook(el);
                } catch(err) {
                    throwQuantum(el, err);
                }
            }
        });

        if (delete prototype[propertyName]) 
        {
            Object.defineProperty(prototype, propertyName, 
            {
                get: () => (provider && provider.retrieve()) || defaultValue,
                set: v => defaultValue = v,
                enumerable: true,
                configurable: true
            });
        }
    } 
}

export function WatchContext(key?: string) 
{ 
    return function (prototype: ComponentPrototype, propertyName: string, propertyDesciptor: PropertyDescriptor): PropertyDescriptor
    {
        key = key || propertyName;
        const method = propertyDesciptor.value;

        hookComponent(prototype, "componentWillLoad", obj => {
            const el = getEl(obj);
            let unlisten = () => {};

            try {
                const provider = Provider.find(el, key!);
                unlisten = provider.listen(v => method.apply(obj, [v]));
            } catch(err) {}

            return () => {
                unlisten();
                try {
                    const provider = Provider.find(el, key!);
                    provider.listen(v => { 
                        try {
                            return method.apply(obj, [v]);
                        } catch(err) {
                            throwQuantum(el, err);
                        }
                    });
                } catch(err) {
                    throwQuantum(el, err);
                }
            }
        });

        return propertyDesciptor;
    } 
}
