import { Provider } from "./provider";


type MaybePromise<T> = T|Promise<T>;
type LifecycleMethod = (...args: any[]) => MaybePromise<void>;

class ContextError extends Error {}

interface ContextFrame {
    obj: Object;
    providers: Provider<any>[];
}
let contextStack = [] as ContextFrame[];

export function Provide(key?: string|symbol) 
{ 
    return function (prototype: Object, propertyName: string)
    {
        console.log(prototype, propertyName);

        key = key || propertyName;
        const provider = new Provider(key, prototype[propertyName]);

        hookComponent(prototype, obj => pushProvider(provider, obj), popFrame);

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
    return function (prototype: {el: HTMLElement}, propertyName: string)
    {
        console.log(prototype, propertyName);

        key = key || propertyName;
        let provider: Provider<any>;

        hookComponent(prototype, obj => {
            console.log("Context WillLoad", obj);
            provider = findProvider(key);
            provider.listen(() => forceUpdate(obj, true));
            console.log("Found provider", key, provider);
        });

        if (delete prototype[propertyName]) 
        {
            Object.defineProperty(prototype, propertyName, 
            {
                get: () => provider && provider.retrieve(),
                enumerable: true,
                configurable: true
            });
        }
    } 
}

/**
 * Only run from componentWillLoad()
 * @param _this 
 * @param key 
 * @param value 
 */
export function createProvider<T>(_this: Object, key: string|symbol, value: T): Provider<T>
{
    const provider = new Provider(key, value);

    pushProvider(_this, provider);
    hookComponent(_this.constructor.prototype, nop, popFrame);

    return provider;
}

/**
 * Only run from componentWillLoad()
 * @param obj 
 * @param key 
 * @param value 
 */
export function findProvider(key: string)
{
    for (let i = contextStack.length - 1; i >= 0; i--)
    {
        const frame = contextStack[i];
        const found = frame.providers.filter(provider => provider.key === key);
        console.log ("Searching", frame);
        console.log("Found", found);
        if (found.length > 1) {
            throw new ContextError(`Found multiple providers with key "${key}" on the same object!`);
        } else if (found.length === 1) {
            return found[0];
        }
    }

    throw new ContextError(`No provider with key "${key}" found in context!`);
}

function forceUpdate(_this: any, showWarn = false)
{
    const el = _this && _this["el"];
    if (el instanceof Object && typeof el.forceUpdate === "function") {
        el.forceUpdate();
        return true;
    } else {
        if (showWarn) console.warn("El not found, unable to force update", _this);
        return false;
    }
}


function hookComponent(prototype: Object, willLoad: (obj: any) => void, didLoad: (obj: any) => void = nop)
{
    console.log("hooking", prototype);

    const _componentWillLoad: LifecycleMethod = prototype["componentWillLoad"] || nop;
    const _componentDidLoad: LifecycleMethod = prototype["componentDidLoad"] || nop;

    prototype["componentWillLoad"] = function(...args: any[]) {
        console.log("Will load", this);
        willLoad(this);
        return _componentWillLoad.apply(this, args);
    }

    prototype["componentDidLoad"] = function(...args: any[]) {
        console.log("Did load", this);
        didLoad(this);
        return _componentDidLoad.apply(this, args);
    }
}


const currentFrame = () => contextStack.length === 0 ? undefined : contextStack[contextStack.length - 1];

const pushFrame = (obj: Object) => 
{ 
    let frame = currentFrame();
    if (!frame || frame.obj !== obj) {
        frame = {obj, providers: []};
        contextStack = [...contextStack, frame]; 
        console.log("Push Frame", obj);
    }
    return frame;
}

const popFrame = (obj: Object) => 
{ 
    let frame = currentFrame();
    if (frame && frame.obj === obj) {
        contextStack = contextStack.length === 0 ? [] : contextStack.slice(0, contextStack.length - 1); 
        console.log("Pop Frame", obj);
        return frame;
    }
    return undefined;
}

const pushProvider = (obj: Object, provider: Provider<any>) => 
{ 
    let frame = pushFrame(obj);
    frame.providers = [...frame.providers, provider]; 
    provider.listen(() => forceUpdate(obj, false));
    console.log("Push Provider", provider, obj);
}

const nop = () => {};
