
export type ProvideCallback<T> = (value: T) => void;

export class Provider<T>
{
    listeners = [] as ProvideCallback<T>[];

    constructor(public readonly key: string|symbol, private value: T)
    {
        this.retrieve = this.retrieve.bind(this);
        this.provide = this.provide.bind(this);
        this.listen = this.listen.bind(this);
    }

    retrieve(): T
    {
        return this.value;
    }

    provide(value: T)
    {
        this.value = value;
        this.listeners.forEach(cb => cb(value));
    }

    update(fn: (v: T) => T)
    {
        this.provide(fn(this.retrieve()));
    }

    listen(cb: ProvideCallback<T>)
    {
        this.listeners = [...this.listeners, cb];
        cb(this.value);
        return () => {
            this.listeners = this.listeners.filter(_cb => _cb !== cb);
        }
    }
}
