import { Provider } from "./provider";
import { getEl, hookComponent, ComponentPrototype, log } from "./utils";
import { HTMLStencilElement } from "@stencil/core/internal";
import { RestypedBase } from "restyped";
import { throwQuantum } from "./error";

export interface AxiosResponse<T>
{
    data: T;
}

export interface AxiosInstance
{
    get(path: string, config?: { 
        params?: Record<string, string> 
    }): Promise<AxiosResponse<any>>;
    put(path: string, data: any, config?: { 
        params?: Record<string, string>
    }): Promise<AxiosResponse<any>>;
}

type Methods = "GET"|"POST"|"PUT"|"DELETE";
type ValidPrototype<Schema extends RestypedBase, Path extends ValidPath<Schema>, Method extends Methods> = 
    Schema[Path][Method] extends undefined ? never : ComponentPrototype;
type ValidPath<Schema extends RestypedBase> = Schema extends RestypedBase ? keyof Schema : string;

export function Rest<
    Schema extends RestypedBase = any, 
    Path extends ValidPath<Schema> = ValidPath<Schema>, 
    Proto extends ValidPrototype<Schema, Path, "GET"> = ValidPrototype<Schema, Path, "GET">
>(axiosKey: string, path: Path, paramsKey?: string, responseKey?: string, debounceTime = 100)
{ 
    return Http<Schema, Path, "GET", Proto>(axiosKey, path, paramsKey, 
    {
        init(ctx) {
            ctx.sendNext = false;
        },

        onComponent(ctx) {
            if (responseKey !== undefined) {
                ctx.responseProvider = Provider.create(ctx.el!, responseKey!, undefined);
            }
        },

        onAxios(ctx) {
            if (!paramsKey || !!ctx.params) ctx.fns!.send!(ctx as any);
        },

        onParams(ctx) {
            if (!!ctx.axios) ctx.fns!.send!(ctx as any);
        },

        async send(ctx) {
            if (ctx.sendNext) {
                ctx.sendNext = false;
                log("Sending Rest PUT", ctx);
                const response = await ctx.axios.put(ctx.query.path, ctx.value, {params: ctx.query.params});
                if (ctx.responseProvider) {
                    ctx.responseProvider.provide(response);
                }
            }
            log("Sending Rest GET", ctx);
            const response = await ctx.axios.get(ctx.query.path, {params: ctx.query.params});
            ctx.value = response.data;
            ctx.el.forceUpdate();
        },
    
        setValue(value, ctx) {
            ctx.value = value;

            ctx.sendNext = true;
            if (!!ctx.axios && (!paramsKey || !!ctx.params)) {
                ctx.fns!.send!(ctx as any);
            }

            if (ctx.el) ctx.el.forceUpdate();
        },

        getValue(ctx) {
            return ctx.value;
        }
        
    }, debounceTime);
} 

export function Get<
    Schema extends RestypedBase = any, 
    Path extends ValidPath<Schema> = ValidPath<Schema>, 
    Proto extends ValidPrototype<Schema, Path, "GET"> = ValidPrototype<Schema, Path, "GET">
>(axiosKey: string, path: Path, paramsKey?: string, debounceTime = 100)
{ 
    return Http<Schema, Path, "GET", Proto>(axiosKey, path, paramsKey, 
    {
        onAxios(ctx) {
            log ("GET onAxios", ctx.params);
            if (!paramsKey || !!ctx.params) ctx.fns!.send!(ctx as any);
        },

        onParams(ctx) {
            log ("GET onParams", ctx.params, ctx.query);
            if (!!ctx.axios) ctx.fns!.send!(ctx as any);
        },

        async send(ctx) {
            log("GET send", ctx);
            const response = await ctx.axios.get(ctx.query.path, {params: ctx.query.params});
            ctx.value = response.data;
            ctx.el.forceUpdate();
        },
    
        setValue(value, ctx) {
            ctx.value = value;
            if (ctx.el) ctx.el.forceUpdate();
        },

        getValue(ctx) {
            return ctx.value;
        }
        
    }, debounceTime);
} 

export function Put<
    Schema extends RestypedBase = any, 
    Path extends ValidPath<Schema> = ValidPath<Schema>, 
    Proto extends ValidPrototype<Schema, Path, "PUT"> = ValidPrototype<Schema, Path, "PUT">
>(axiosKey: string, path: Path, paramsKey?: string, responseKey?: string, debounceTime = 100)
{ 
    return Http<Schema, Path, "PUT", Proto>(axiosKey, path, paramsKey, 
    {
        init(ctx) {
            ctx.onReady = () => {};
        },

        onComponent(ctx) {
            if (responseKey !== undefined) {
                ctx.responseProvider = Provider.create(ctx.el!, responseKey!, undefined);
            }
        },

        onAxios(ctx) {
            if (!paramsKey || !!ctx.params) ctx.onReady();
        },

        onParams(ctx) {
            if (!!ctx.axios) ctx.onReady();
        },

        async send(ctx) {
            log("Sending PUT", ctx);
            const response = await ctx.axios.put(ctx.query.path, ctx.value, {params: ctx.query.params});
            if (ctx.responseProvider) {
                ctx.responseProvider.provide(response);
            }
        },
    
        setValue(value, ctx) {
            ctx.value = value;
            if (!!ctx.axios && (!paramsKey || !!ctx.params)) {
                ctx.fns!.send!(ctx as any);
            } else {
                ctx.onReady = () => ctx.fns!.send!(ctx as any);
            }
            
            if (ctx.el) ctx.el.forceUpdate();
        },

        getValue(ctx) {
            return ctx.value;
        }
        
    }, debounceTime);
} 

interface HttpContext<Schema> {
    proto: ComponentPrototype;
    propertyName: string;
    obj: any;
    value: any;
    el: HTMLStencilElement;
    axios: AxiosInstance;
    path: ValidPath<Schema>;
    params?: Record<string, any>;
    fns: HttpCallbacks<Schema>;
    [key: string]: any;
}

interface HttpCallbacks<Schema> {
    setValue(value: any, ctx: Partial<HttpContext<Schema>>): void;
    getValue(ctx: Partial<HttpContext<Schema>>): any;
    init?(ctx: Partial<HttpContext<Schema>>): void;
    send?(ctx: HttpContext<Schema>): void|Promise<void>;
    onComponent?(ctx: Partial<HttpContext<Schema>>): void|Promise<void>;
    onAxios?(ctx: Partial<HttpContext<Schema>>): void|Promise<void>;
    onParams?(ctx: Partial<HttpContext<Schema>>): void|Promise<void>;
}

function Http<
    Schema extends RestypedBase = any, 
    Path extends ValidPath<Schema> = ValidPath<Schema>, 
    Method extends Methods = "GET",
    Proto extends ValidPrototype<Schema, Path, Method> = ValidPrototype<Schema, Path, Method>
>(axiosKey: string, path: Path, paramsKey: string|undefined, fns: HttpCallbacks<Schema>, debounceTime = 100)
{ 
    return function (prototype: Proto, propertyName: string)
    {
        const ctx: Partial<HttpContext<Schema>> = {
            proto: prototype,
            propertyName,
            value: prototype[propertyName],
            path,
            fns,
            query: makeQuery(path as string)
        };
        if (ctx.fns!.init) ctx.fns!.init(ctx);

        hookComponent(prototype, "componentWillLoad", async obj => {
            ctx.obj = obj;
            ctx.el = getEl(ctx.obj);          
            try {
                if (ctx.fns!.onComponent) await ctx.fns!.onComponent(ctx);
            } catch(err) {
                throwQuantum(ctx.el!, err);
            }

            return () => {
                try {
                    Provider.find<AxiosInstance>(ctx.el!, axiosKey).listen(async a => {
                        try {
                            ctx.axios = a;
                            if (ctx.fns && ctx.fns.onAxios) await ctx.fns.onAxios(ctx);
                        } catch(err) {
                            throwQuantum(ctx.el!, err);
                        }
                    });        
                    
                    let debounceHandle: any;
                    if (paramsKey !== undefined)
                    Provider.find<Record<string, any>>(ctx.el!, paramsKey).listen(async p => {
                        log("Pre onParams", p);
                        ctx.params = p;
                        ctx.query = makeQuery(ctx.path as string, ctx.params);

                        if (debounceHandle) clearTimeout(debounceHandle);
                        debounceHandle = setTimeout(async () => {
                            try {
                                await ctx.fns?.onParams?.(ctx);
                            } catch(err) {
                                throwQuantum(ctx.el!, err);
                            }
                        }, debounceTime);
                    });
                } catch(err) {
                    throwQuantum(ctx.el!, err);
                }
            } 
        });

        if (delete prototype[propertyName]) 
        {
            Object.defineProperty(prototype, propertyName, 
            {
                get: () => ctx.fns && ctx.fns.getValue(ctx),
                set: (v) => ctx.fns && ctx.fns.setValue(v, ctx),
                enumerable: true,
                configurable: true
            });
        }
    } 
}

const pathMapping = [
    {
        replace: (key: string) => `{${key}}`,
        with: (value: string) => `${value}`
    },
    {
        replace: (key: string) => `/\\:${key}$`,
        with: (value: string) => `/${value}`
    },
    {
        replace: (key: string) => `/\\:${key}/`,
        with: (value: string) => `/${value}/`
    },
]

const defaultWith = (value: string) => `${value}`;

function makeQuery(path: string, params?: Record<string, any>)
{
    let p = path;
    let query: Record<string, string> = {};
    if (!!params) {
        for (let [key, value] of Object.entries(params)) {

            const origP = p;
            p = pathMapping.reduce((a, m) => {
                const k = m.replace(key);
                log("------ Checking ", a, "with", k);
                return !a.match(new RegExp(k, "g")) ? a 
                    : a.replace(new RegExp(k, "g"), escape(m.with?.(value) ?? defaultWith(value)));
            }, p);

            if (p === origP) {
                query[key] = value;
            }
        }
    }

    return {
        path: p,
        params: query
    };
}

