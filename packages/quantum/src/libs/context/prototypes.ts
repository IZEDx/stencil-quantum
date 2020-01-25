import { QuantumConfig, ContextType } from "../key";

export type TypedContextPrototype<T extends QuantumConfig<any>, K extends keyof T["keys"], P extends string> = {
    componentWillLoad?: (...args: any[]) => Promise<void>|void;
    componentDidLoad?: (...args: any[]) => Promise<void>|void;
} & { [L in P]: ContextType<T, K> };


export type TypedObservePrototype<
    T extends QuantumConfig<any>, 
    K extends keyof T["keys"], 
    P extends string
> = {
    componentWillLoad?: (...args: any[]) => Promise<void>|void;
    componentDidLoad?: (...args: any[]) => Promise<void>|void;
} & { [L in P]: (val: ContextType<T, K>) => any };


export type TypedReactPrototype<
    T1 extends QuantumConfig<any>, K1 extends keyof T1["keys"], 
    T2 extends QuantumConfig<any>, K2 extends keyof T2["keys"], 
    P extends string
> = {
    componentWillLoad?: (...args: any[]) => Promise<void>|void;
    componentDidLoad?: (...args: any[]) => Promise<void>|void;
} & { [L in P]: (val: ContextType<T1, K1>) => ContextType<T2, K2>|Promise<ContextType<T2, K2>> };
