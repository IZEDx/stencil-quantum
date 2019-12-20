import { Provider } from "./provider";
import { getEl, hookComponent, ComponentPrototype } from "./utils";
import { HTMLStencilElement } from "@stencil/core/internal";
import { throwQuantum } from "./error";

export interface EventEmitter
{
    emit(event: string, ...args: any[]): EventEmitter;
    on(event: string, fn: (...args: any[]) => any): EventEmitter;
    once(event: string, fn: (...args: any[]) => any): EventEmitter;
    off(event: string, fn: (...args: any[]) => any): EventEmitter;
}

type EmitEvents<T> = T extends EventEmitter ? Parameters<T["emit"]>[0] : string;

export interface EventOptions<E extends string|undefined>
{
    emitter: string;
    namespace?: string;
    on?: E
}

export function Emit<
    T extends EventEmitter = any, 
    E extends EmitEvents<T>|undefined = any
>(opts: EventOptions<E>) 
{ 
    return function (prototype: ComponentPrototype, propertyName: E extends EmitEvents<T> ? string : E)
    {
        const _event = opts.on ?? propertyName!;
        let provider: Provider<EventEmitter>;
        let value: any = prototype[propertyName as string];

        hookComponent(prototype, "componentWillLoad", obj => {
            const el = getEl(obj);
            
            try {
                provider = Provider.find(el, opts.emitter, opts.namespace);
                if (value) provider.retrieve().emit(_event, value);
                provider.hook(el);
            } catch(err) {
                
            }

            return () => {
                try {
                    if (provider) provider.unhook(el);
                    provider = Provider.find(el, opts.emitter);
                    if (value) provider.retrieve().emit(_event!, value);
                    provider.hook(el);
                } catch(err) {
                    throwQuantum(el!, err);
                }
            }
        });

        if (delete prototype[propertyName as string]) 
        {
            Object.defineProperty(prototype, propertyName as string, 
            {
                get: () => value,
                set: (v: any) => {
                    provider?.retrieve().emit(_event!, v);
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
    E extends ReceiveEvents<T>|undefined = any
>(opts: EventOptions<E>) 
{ 
    return function (prototype: ComponentPrototype, propertyName: E extends ReceiveEvents<T> ? string : E)
    {
        const _event = opts.on ?? propertyName!;
        let el: HTMLStencilElement;
        let value: any = prototype[propertyName as string];

        const onValue = (v: any) => {
            value = v;
            el?.forceUpdate();
        };

        hookComponent(prototype, "componentWillLoad", obj => {
            let provider: Provider<any>;
            let lastEmitter: EventEmitter;
            el = getEl(obj);

            const findAndListen = (onErr = (e: any) => {}) => {
                try {
                    if (!provider) {
                        provider = Provider.find<EventEmitter>(el, opts.emitter, opts.namespace);
                        provider.listen(emitter => {
                            lastEmitter?.off(_event, onValue);
                            emitter.on(_event, onValue);
                            lastEmitter = emitter;
                        });
                    }
                } catch(err) {
                    onErr(err);
                }
            }

            findAndListen();
            
            return () => findAndListen(err => throwQuantum(el!, err));
        });

        if (delete prototype[propertyName as string]) 
        {
            Object.defineProperty(prototype, propertyName as string, 
            {
                get: () => value,
                set: onValue,
                enumerable: true,
                configurable: true
            });
        }
    } 
}




