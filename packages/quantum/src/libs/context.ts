import { Provider } from "./provider";
import { getEl, hookComponent, ComponentPrototype } from "./utils";
import { throwQuantum } from "./error";

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
        const method = propertyDesciptor.value;

        hookComponent(prototype, "componentWillLoad", obj => 
        {
            const el = getEl(obj);
            let unlisten = () => {};
            let resultProvider: Provider<any>;
            if (key) {
                resultProvider = Provider.create(el, propertyName, undefined);
            }

            const hookProvider = () => 
            {
                const provider = Provider.find(el, key ?? propertyName);
                provider.listen(v => 
                { 
                    try {
                        const result = method.apply(obj, [v]);
                        if (resultProvider) resultProvider.provide(result);
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
