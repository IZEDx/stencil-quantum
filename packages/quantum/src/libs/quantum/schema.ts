
export function qt<T>(opts: QuantumType<T> = {}): QuantumType<T>
{
    return opts;
}

export type QuantumSchema = Record<string, QuantumType<any>>;

export interface QuantumType<T>
{
    default?: T;
    mutable?: boolean;
}
