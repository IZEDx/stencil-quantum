import { QuantumConfig, qt } from "stencil-quantum/dist/types/libs/key";

export const test = new QuantumConfig({
    personToGreet: qt<string>()
});
