import { QuantumConfig, qt } from "stencil-quantum";
import { TypedAxiosInstance } from "restyped-axios";
import { APISchema } from "../api.schema";

export const demo = new QuantumConfig({
    personToGreet: qt<string>({ mutable: true }),
    api: qt<TypedAxiosInstance<APISchema>>()
});


