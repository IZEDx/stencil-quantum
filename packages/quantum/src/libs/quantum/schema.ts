
export function qt<T>(opts: QuantumType<T> = {}): QuantumType<T>
{
    return opts;
}

export function qa<P extends any[], R>(opts: QuantumAction<P, R> = {}): QuantumAction<P, R>
{
    return opts;
}

export type QuantumSchema = Record<string, QuantumType<any>>;

export type QuantumAction<P extends any[], R> = QuantumType<(...params: P) => Promise<R>>

export interface QuantumType<T>
{
    default?: T;
    mutable?: boolean;
    debug?: boolean;
}

