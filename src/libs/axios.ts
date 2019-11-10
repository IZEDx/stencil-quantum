import { Provider } from "./provider";
import { getEl, hookComponent, ComponentPrototype } from "./utils";
import { HTMLStencilElement } from "@stencil/core/internal";

export interface AxiosResponse<T>
{
    data: T;
}

export interface AxiosInstance
{
    get(path: string, config?: { params?: Record<string, string> }): Promise<AxiosResponse<any>>;
}

export function Get(axiosKey: string, path: string, paramsKey?: string) 
{ 
    return function (prototype: ComponentPrototype, propertyName: string)
    {
        let value: any = prototype[propertyName];
        let el: HTMLStencilElement;
        let axios: AxiosInstance;
        let params: Record<string, any>;

        const get = async (params?: Record<string, any>) => {
            const query = makeQuery(path, params);
            const response = await axios.get(query.path, {params: query.params});
            value = response.data();
            el.forceUpdate();
        }

        hookComponent(prototype, async obj => {
            el = getEl(obj);            
            
            Provider.find<AxiosInstance>(el, axiosKey).listen(async a => {
                axios = a
                if (!paramsKey || !!params) get();
            });        
            
            if (paramsKey !== undefined)
            Provider.find<Record<string, any>>(el, paramsKey).listen(async p => {
                params = p;
                if (!!axios) get();
            });

        });

        if (delete prototype[propertyName]) 
        {
            Object.defineProperty(prototype, propertyName, 
            {
                get: () => value,
                enumerable: true,
                configurable: true
            });
        }
    } 
}


function makeQuery(path: string, params?: Record<string, any>)
{
    let p = path;
    let query: Record<string, string> = {};
    if (!!params) {
        for (let [key, value] of Object.entries(params)) {
            value = `${value}`;
            if (p.includes(`{${key}}`)) {
                p = p.replace(new RegExp(`{${key}}`, "g"), escape(value));
            } else {
                query[key] = value;
            }
        }
    }

    return {
        path: p,
        params: query
    };
}

