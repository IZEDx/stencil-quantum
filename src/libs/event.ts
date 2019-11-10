import { Provider } from "./provider";
import { getEl, hookComponent, ComponentPrototype } from "./utils";
import { HTMLStencilElement } from "@stencil/core/internal";

export interface EventEmitter
{
    emit(event: string, ...args: any[]): EventEmitter;
    on(event: string, fn: (...args: any[]) => any): EventEmitter;
    once(event: string, fn: (...args: any[]) => any): EventEmitter;
    off(event: string, fn: (...args: any[]) => any): EventEmitter;
}

export function Emit<K extends string>(emitterKey: K, event?: string) 
{ 
    return function (prototype: ComponentPrototype, propertyName: string)
    {
        event = event || propertyName;
        let provider: Provider<EventEmitter>;
        let value: any = prototype[propertyName];

        hookComponent(prototype, obj => {
            const el = getEl(obj);
            provider = Provider.find(el, emitterKey);
            if (value) provider.retrieve().emit(event!, value);
            provider.hook(el);
        });

        if (delete prototype[propertyName]) 
        {
            Object.defineProperty(prototype, propertyName, 
            {
                get: () => value,
                set: (v: any) => {
                    if (provider) {
                        provider.retrieve().emit(event!, v);
                    }
                    value = v;
                },
                enumerable: true,
                configurable: true
            });
        }
    } 
}

export function Receive(emitterKey: string, event?: string) 
{ 
    return function (prototype: ComponentPrototype, propertyName: string)
    {
        event = event || propertyName;
        let el: HTMLStencilElement;
        let value: any = prototype[propertyName];

        const onValue = (v: any) => {
            value = v;
            if (el) el.forceUpdate();
        };

        hookComponent(prototype, obj => {
            let lastEmitter: EventEmitter;
            el = getEl(obj);

            const provider = Provider.find<EventEmitter>(el, emitterKey!);
            provider.listen(emitter => {
                if (lastEmitter) lastEmitter.off(event!, onValue);
                emitter.on(event!, onValue);
            });
        });

        if (delete prototype[propertyName]) 
        {
            Object.defineProperty(prototype, propertyName, 
            {
                get: () => value,
                set: onValue,
                enumerable: true,
                configurable: true
            });
        }
    } 
}




