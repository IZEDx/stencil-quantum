import { Provider } from "./provider";
import { getEl, hookComponent, ComponentPrototype } from "./utils";

export function Provide(key?: string|symbol) 
{ 
    return function (prototype: ComponentPrototype, propertyName: string)
    {
        key = key || propertyName;
        const provider = new Provider(key, prototype[propertyName]);

        hookComponent(prototype, obj => {
            const el = getEl(obj);
            provider.attach(el);
            provider.hook(el);
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

        hookComponent(prototype, obj => {
            const el = getEl(obj);
            provider = Provider.find(el, key!);
            provider.hook(el);
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

        hookComponent(prototype, obj => {
            const el = getEl(obj);
            const provider = Provider.find(el, key!);
            provider.listen(v => method.apply(obj, [v]));
        });

        return propertyDesciptor;
    } 
}
