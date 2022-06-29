import { h } from "@stencil/core"
import { Provider } from "./provider";
import { QuantumKey, ResolveQuantumKey } from "./quantum"

export function QuantumConsume<
    B extends QuantumKey<any, any>
>(props: {
    bind: B,
    onUpdate: (value: ResolveQuantumKey<B, B["config"]>, provider: Provider<ResolveQuantumKey<B, B["config"]>>) => any
}, children?: any)
{
    return  <quantum-consumer 
                bind={props.bind} 
                onUpdate={e => props.onUpdate(e.detail.value, e.detail.provider)}
            >{children}</quantum-consumer>
}

export function QuantumProvide<
    B extends QuantumKey<any, any>, 
    T extends ResolveQuantumKey<B, B["config"]>
>(props: {
    bind: B,
    value?: T
    onUpdate?: (value: T, provider: Provider<T>) => any
}, children?: any)
{
    return  <quantum-provider
                bind={props.bind}
                onUpdate={e => props.onUpdate?.(e.detail.value, e.detail.provider)}
                value={props.value}
            >{children}</quantum-provider>

}

/*

const test = new Entanglement({
    test: qt<boolean>()
});

function testJSX()
{
    return <Consumer bind={test.get("test")} onValue={(value, provider) => {provider.provide(!value)}}></Consumer>
}

function testFn()
{
    return <div>
        {Consumer({bind: test.get("test"), onValue: value => {}})}
    </div>
}

type B = QuantumKey<boolean, typeof test>;
type C = B["config"];
type N = B["name"];
type T = ResolveQuantumKey<B, C>;

*/