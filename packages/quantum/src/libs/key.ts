import { Context, ContextDecorator, Provide, Observe, ObserveDecorator, React, ReactDecorator, ProvideDecorator } from "./context";

// TODO: Check what actually needs to be exported

export function qt<T>(opts: QuantumType<T> = {}): QuantumType<T>
{
    return opts;
}

export interface QuantumType<T>
{
    default?: T;
    mutable?: boolean;
}

export type ContextType<T extends QuantumConfig<any>, K extends keyof T["keys"]> = QuantumKeyToType<T["keys"][K]>;

export interface ConfigOptions 
{
    namespace?: string;
}

// TODO: factory function that adds all keys to the config;
export class QuantumConfig<T extends QuantumSchema>
{
    public keys: QuantumKeys<T>;

    constructor(schema: T, opts?: ConfigOptions)
    {
        this.keys = Object.entries(schema)
            .map(([key, value]) => ({
                name: key,
                namespace: opts?.namespace,
                default: value.default
            }))
            .reduce((a, b) => ({
                ...a, [b.name]: b
            }), {} as QuantumKeys<T>);
    }

    get<K extends keyof QuantumKeys<T>>(key: K): QuantumKeys<T>[K]
    {
        return this.keys[key];
    }

    Provide<K extends keyof QuantumKeys<T>>(key: K): ProvideDecorator<QuantumConfig<T>, K>
    {
        return Provide(this, key);
    }

    Context<K extends keyof QuantumKeys<T>>(key: K): ContextDecorator<QuantumConfig<T>, K>
    {
        return Context(this, key);
    }

    Observe<K extends keyof QuantumKeys<T>>(key: K): ObserveDecorator<QuantumConfig<T>, K>
    {
        return Observe(this, key);
    }

    React<K extends keyof QuantumKeys<T>, Q extends QuantumConfig<any>, QK extends keyof Q["keys"]>(key: K, target: Q, targetKey: QK): ReactDecorator<QuantumConfig<T>, K, Q, QK>
    {
        return React(this, key, target, targetKey);
    }
}

export type QuantumSchema = Record<string, QuantumType<any>>;

export type QuantumKeys<T extends Record<string, QuantumType<any>>> =
{
    [K in keyof T]: QuantumKey<QuantumTypeToType<T, K>>;
}

type QuantumTypeToType<T extends Record<string, QuantumType<any>>, K extends keyof T> = T[K] extends QuantumType<infer R> ? R : never;
type QuantumKeyToType<K> = K extends QuantumKey<infer T> ? T : never;

export interface QuantumKey<T> extends ConfigOptions, QuantumType<T>
{
    name: string;
}

/*
const store = new QuantumConfig({
    myValue: qt<number>(6565),
    myString: qt<string>("bla")
}, {
    namespace: "lol"
});

const key = store.get("myValue");
key.namespace

const test: ContextType<typeof store, "myValue">;
*/