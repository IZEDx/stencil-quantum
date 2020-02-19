import { QuantumSchema } from "./schema";
import { QuantumKeys } from "./keys";
import { ReactDecorator, React, Observe, Context, Provide, ProvideDecorator, ContextDecorator, ObserveDecorator } from "../context";

export interface EntangleOptions 
{
    namespace?: string;
}


// TODO: factory function that adds all keys to the config;
export class Entanglement<T extends QuantumSchema>
{
    public keys: QuantumKeys<T>;

    constructor(schema: T, opts?: EntangleOptions)
    {
        this.keys = Object.entries(schema)
            .map(([key, value]) => ({
                name: key,
                namespace: opts?.namespace,
                default: value.default,
                mutable: value.mutable,
                config: this
            }))
            .reduce((a, b) => ({
                ...a, [b.name]: b
            }), {} as QuantumKeys<T>);
    }

    get<K extends keyof QuantumKeys<T>>(key: K): QuantumKeys<T>[K]
    {
        return this.keys[key];
    }

    Provide<K extends keyof QuantumKeys<T>>(key: K): ProvideDecorator<Entanglement<T>, K>
    {
        return Provide(this as Entanglement<T>, key);
    }

    Context<K extends keyof QuantumKeys<T>>(key: K): ContextDecorator<Entanglement<T>, K>
    {
        return Context(this as Entanglement<T>, key);
    }

    Observe<K extends keyof QuantumKeys<T>>(key: K): ObserveDecorator<Entanglement<T>, K>
    {
        return Observe(this as Entanglement<T>, key);
    }

    React<K extends keyof QuantumKeys<T>, Q extends Entanglement<any>, QK extends keyof Q["keys"]>(key: K, target: Q, targetKey: QK): ReactDecorator<Entanglement<T>, K, Q, QK>
    {
        return React(this as Entanglement<T>, key, target, targetKey);
    }
}
