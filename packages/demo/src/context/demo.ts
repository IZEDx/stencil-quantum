import { Entanglement, qt } from "stencil-quantum";
import { TypedAxiosInstance } from "restyped-axios";
import { APISchema } from "../api.schema";

export const demo = new Entanglement({
    personToGreet: qt<string>({ mutable: true }),
    api: qt<TypedAxiosInstance<APISchema>>()
});


