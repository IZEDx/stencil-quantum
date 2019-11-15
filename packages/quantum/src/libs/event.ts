import { Provider } from "./provider";
import { getEl, hookComponent, ComponentPrototype, throwQuantum } from "./utils";
import { HTMLStencilElement } from "@stencil/core/internal";

export interface EventEmitter
{
    emit(event: string, ...args: any[]): EventEmitter;
    on(event: string, fn: (...args: any[]) => any): EventEmitter;
    once(event: string, fn: (...args: any[]) => any): EventEmitter;
    off(event: string, fn: (...args: any[]) => any): EventEmitter;
}

type EmitEvents<T> = T extends EventEmitter ? Parameters<T["emit"]>[0] : string;

export function Emit<
    T extends EventEmitter = any, 
    E extends EmitEvents<T> = EmitEvents<T>, 
    Event extends E|undefined = E|undefined
>(emitterKey: string, event?: Event) 
{ 
    return function (prototype: ComponentPrototype, propertyName: Event extends E ? string : E)
    {
        const _event = event || propertyName;
        let provider: Provider<EventEmitter>;
        let value: any = prototype[propertyName];

        hookComponent(prototype, "componentWillLoad", obj => {
            const el = getEl(obj);
            
            try {
                provider = Provider.find(el, emitterKey);
                if (value) provider.retrieve().emit(_event!, value);
                provider.hook(el);
            } catch(err) {
                
            }

            return () => {
                try {
                    if (provider) provider.unhook(el);
                    provider = Provider.find(el, emitterKey);
                    if (value) provider.retrieve().emit(_event!, value);
                    provider.hook(el);
                } catch(err) {
                    throwQuantum(el!, err);
                }
            }
        });

        if (delete prototype[propertyName]) 
        {
            Object.defineProperty(prototype, propertyName, 
            {
                get: () => value,
                set: (v: any) => {
                    if (provider) {
                        provider.retrieve().emit(_event!, v);
                    }
                    value = v;
                },
                enumerable: true,
                configurable: true
            });
        }
    } 
}

type ReceiveEvents<T> = T extends EventEmitter ? Parameters<T["on"]>[0] : string;

export function Receive<
    T extends EventEmitter = any, 
    E extends ReceiveEvents<T> = ReceiveEvents<T>, 
    Event extends E|undefined = E|undefined
>(emitterKey: string, event?: Event) 
{ 
    return function (prototype: ComponentPrototype, propertyName: Event extends E ? string : E)
    {
        const _event = event || propertyName;
        let el: HTMLStencilElement;
        let value: any = prototype[propertyName as string];

        const onValue = (v: any) => {
            value = v;
            if (el) el.forceUpdate();
        };

        hookComponent(prototype, "componentWillLoad", obj => {
            let provider: Provider<any>;
            let lastEmitter: EventEmitter;
            let unlisten = () => {};
            el = getEl(obj);

            try {
                provider = Provider.find(el, emitterKey);
                provider.listen(emitter => {
                    if (lastEmitter) lastEmitter.off(_event!, onValue);
                    emitter.on(_event!, onValue);
                });
            } catch(err) {

            }
            
            return () => {
                try {
                    if (provider) unlisten();
                    provider = Provider.find<EventEmitter>(el, emitterKey!);
                    provider.listen(emitter => {
                        if (lastEmitter) lastEmitter.off(_event!, onValue);
                        emitter.on(_event!, onValue);
                    });
                } catch(err) {
                    throwQuantum(el!, err);
                }
            }
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




