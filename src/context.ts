import { Provider } from "./provider";


type MaybePromise<T> = T|Promise<T>;
type LifecycleMethod = (...args: any[]) => MaybePromise<void>;

class ContextError extends Error {}

const nop = () => {};
interface ContextFrame {
    obj: Object;
    providers: Provider<any>[];
}
let contextStack = [] as ContextFrame[];
const pushFrame = (frame: ContextFrame) => { contextStack = [...contextStack, frame]; }
const popFrame = () => { contextStack = contextStack.length === 0 ? [] : contextStack.slice(0, contextStack.length - 1); }
const pushProvider = (frame: ContextFrame, provider: Provider<any>) => { frame.providers = [...frame.providers, provider]; }
const currentFrame = () => contextStack.length === 0 ? undefined : contextStack[contextStack.length - 1];

export function Provide(key?: string) 
{ 
    return function (target: Object, propertyName: string)
    {
        console.log(target, propertyName);

        key = key || propertyName;
        const provider = new Provider(key, target[propertyName]);

        hookComponent(target, 
            obj => {
                console.log("Provider WillLoad", obj);
                let frame = currentFrame();
                if (!frame || frame.obj !== obj) {
                    frame = {obj, providers: []};
                    pushFrame(frame);
                }
                pushProvider(frame, provider);
                console.log("Push Provider", key, provider);
            }, 
            obj => {
                console.log("Provider DidLoad", obj);
                let frame = currentFrame();
                if (frame && frame.obj === obj) {
                    popFrame();
                    console.log("Pop Frame");
                }
            }
        );

        if (delete target[propertyName]) 
        {
            Object.defineProperty(target, propertyName, 
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
    return function (target: Object, propertyName: string)
    {
        console.log(target, propertyName);

        key = key || propertyName;
        let provider: Provider<any>;

        hookComponent(target, obj => {
            console.log("Context WillLoad", obj);
            provider = findProvider(key);
            provider.listen((val) => {
                const el = obj["el"];
                if (el instanceof Object && typeof el.forceUpdate === "function") {
                    el.forceUpdate();
                } else {
                    console.warn("El not found, unable to force update, for key", key, "on", obj);
                }
            });
            console.log("Found provider", key, provider);
        });

        if (delete target[propertyName]) 
        {
            Object.defineProperty(target, propertyName, 
            {
                get: () => provider && provider.retrieve(),
                enumerable: true,
                configurable: true
            });
        }
    } 
}

function findProvider(key: string)
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


function hookComponent(target: Object, willLoad: (obj: any) => void, didLoad: (obj: any) => void = nop)
{
    const componentWillLoad: LifecycleMethod = target["componentWillLoad"] || nop;
    const componentDidLoad: LifecycleMethod = target["componentDidLoad"] || nop;

    target["componentWillLoad"] = function (...args: any[]) {
        willLoad(this);
        return componentWillLoad.apply(this, args);
    }

    target["componentDidLoad"] = (...args: any[]) => {
        didLoad(this);
        return componentDidLoad.apply(this, args);
    }
}

