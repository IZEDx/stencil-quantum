import { QuantumSchema, QuantumType } from "./schema";
import { Entanglement, EntangleOptions } from "./entanglement";

export type QuantumKeys<T extends QuantumSchema> =
{
    [K in keyof T]: QuantumKey<ResolveQuantumType<T, K>, Entanglement<T>>;
}

export interface QuantumKey<T, C extends Entanglement<any>> extends EntangleOptions, QuantumType<T>
{
    name: string;
    config: C;
}


type ResolveQuantumType<T extends QuantumSchema, K extends keyof T> = 
    T[K] extends QuantumType<infer R> 
    ? R 
    : never

export type ContextType<T extends Entanglement<any>, K extends keyof T["keys"]> = ResolveQuantumKey<T["keys"][K], T>;
type ResolveQuantumKey<K, C extends Entanglement<any>> = K extends QuantumKey<infer T, C> ? T : never;
