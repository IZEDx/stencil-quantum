import { Entanglement, ContextType } from "../quantum";

export interface BaseComponentPrototype
{
    componentWillLoad?: (...args: any[]) => Promise<void>|void;
    componentDidLoad?: (...args: any[]) => Promise<void>|void;
    componentDidUnload?: (...args: any[]) => Promise<void>|void;
    connectedCallback?: (...args: any[]) => Promise<void>|void;
    disconnectedCallback?: (...args: any[]) => Promise<void>|void;
}

export type TypedContextPrototype<
    T extends Entanglement<any>, 
    K extends keyof T["keys"], 
    P extends string
> = BaseComponentPrototype & { [L in P]: ContextType<T, K> };


export type TypedObservePrototype<
    T extends Entanglement<any>, 
    K extends keyof T["keys"], 
    P extends string
> = BaseComponentPrototype & { [L in P]: (val: ContextType<T, K>) => any };


export type TypedReactPrototype<
    T1 extends Entanglement<any>, K1 extends keyof T1["keys"], 
    T2 extends Entanglement<any>, K2 extends keyof T2["keys"], 
    P extends string
> = BaseComponentPrototype & { [L in P]: (val: ContextType<T1, K1>) => ContextType<T2, K2>|Promise<ContextType<T2, K2>> };
