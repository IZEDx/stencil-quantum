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
type ValidPrototype<Schema extends RestypedBase, Path extends ValidUrl<Schema>, Method extends Methods> = 
    Schema[Path][Method] extends undefined ? never : ComponentPrototype;
type ValidUrl<Schema extends RestypedBase> = Schema extends RestypedBase ? keyof Schema : string;


export interface AxiosOptions<Schema extends RestypedBase = any>
{
    axios?: string;
    url: ValidUrl<Schema>;
    params?: string;
    namespace?: string;
    debounce?: number;
    provide?: string;
    lazy?: boolean;
}

export function Rest<Schema>(opts: AxiosOptions<Schema>)
{ 
    opts.lazy = opts.lazy ?? true;
    return Http<Schema>({
        ...opts,

        init(ctx) {
            ctx.sendNext = false;
        },

        onComponent(ctx) {
            if (opts.provide !== undefined) {
                ctx.responseProvider = Provider.create(ctx.el!, opts.provide!, undefined, opts.namespace);
            }
        },

        onAxios(ctx) {
            if (!opts.params || !!ctx.params) {
                const promise = ctx.fns!.send!(ctx as any);
                if (!opts.lazy) return promise;
            }
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
            if (opts.lazy || !ctx.first) ctx.el.forceUpdate();
            if (!ctx.first) ctx.first = true;
        },
    
        setValue(value, ctx) {
            ctx.value = value;

            ctx.sendNext = true;
            if (!!ctx.axios && (!opts.params || !!ctx.params)) {
                ctx.fns!.send!(ctx as any);
            }

            if (ctx.el) ctx.el.forceUpdate();
        },

        getValue(ctx) {
            return ctx.value;
        }
        
    });
} 


export function Get<Schema>(opts: AxiosOptions<Schema>)
{ 
    opts.lazy = opts.lazy ?? true;
    return Http<Schema>({
        ...opts,

        onComponent(ctx) {
            if (opts.provide !== undefined) {
                ctx.provider = Provider.create(ctx.el!, opts.provide!, undefined, opts.namespace);
            }
        },

        onAxios(ctx) {
            log ("GET onAxios", ctx.axios, ctx.params);
            if (!opts.params || !!ctx.params) {
                const promise = ctx.fns!.send!(ctx as any);
                if (!opts.lazy) return promise;
            }
        },

        onParams(ctx) {
            log ("GET onParams", ctx.params, ctx.query);
            if (!!ctx.axios) ctx.fns!.send!(ctx as any);
        },

        async send(ctx) {
            log("GET send", ctx);
            const response = await ctx.axios?.get(ctx.query.path, {params: ctx.query.params});
            ctx.value = response?.data;
            if (ctx.provider) ctx.provider.provide(response.data);
            else if(opts.lazy || !ctx.first) ctx.el?.forceUpdate();
            if (!ctx.first) ctx.first = true;
        },
    
        setValue(value, ctx) {
            ctx.value = value;
            if (ctx.provider) ctx.provider.provide(value);
            else if (ctx.el) ctx.el.forceUpdate();
        },

        getValue(ctx) {
            return ctx.value;
        }
        
    });
} 

export function Put<Schema>(opts: AxiosOptions<Schema>)
{ 
    opts.lazy = opts.lazy ?? true;
    return Http<Schema>({
        ...opts,

        init(ctx) {
            ctx.onReady = () => {};
        },

        onComponent(ctx) {
            if (opts.provide !== undefined) {
                ctx.responseProvider = Provider.create(ctx.el!, opts.provide, undefined);
            }
        },

        onAxios(ctx) {
            if (!opts.params || !!ctx.params) {
                const promise = ctx.onReady();
                if (!opts.lazy) return promise;
            }
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
            if (!!ctx.axios && (!opts.params || !!ctx.params)) {
                ctx.fns!.send!(ctx as any);
            } else {
                ctx.onReady = () => ctx.fns!.send!(ctx as any);
            }
            
            ctx.el?.forceUpdate();
        },

        getValue(ctx) {
            return ctx.value;
        }
        
    });
} 

interface HttpContext<Schema> {
    proto: ComponentPrototype;
    propertyName: string;
    obj: any;
    value: any;
    el: HTMLStencilElement;
    axios: AxiosInstance;
    url: ValidUrl<Schema>;
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

export type HttpOptions<Schema> = AxiosOptions<Schema> & HttpCallbacks<Schema>;

function Http<Schema, Method extends Methods = "GET">(opts: HttpOptions<Schema>)
{ 
    return function (prototype: ValidPrototype<Schema, ValidUrl<Schema>, Method>, propertyName: string)
    {
        const ctx: Partial<HttpContext<Schema>> = {
            proto: prototype,
            propertyName,
            value: prototype[propertyName],
            url: opts.url,
            fns: opts,
            query: makeQuery(opts.url as string)
        };
        ctx.fns?.init?.(ctx);

        hookComponent(prototype, "componentWillLoad", async obj => {
            ctx.obj = obj;
            ctx.el = getEl(ctx.obj);          
            try {
                await ctx.fns?.onComponent?.(ctx);
            } catch(err) {
                throwQuantum(ctx.el!, err);
            }

            return async () => {
                try {
                    await new Promise(res => {
                        let first = true;
                        Provider.find<AxiosInstance>(ctx.el!, opts.axios ?? "axios", opts.namespace).listen(async a => {
                            try {
                                ctx.axios = a;
                                await ctx.fns?.onAxios?.(ctx);
                            } catch(err) {
                                throwQuantum(ctx.el!, err);
                            }
                            if (first) res();
                        })
                    });    
                    
                    if (opts.params !== undefined) await new Promise(res => {
                        let debounceHandle: any;
                        let first = true;
                        Provider.find<Record<string, any>>(ctx.el!, opts.params!, opts.namespace).listen(async p => {
                            log("Pre onParams", p);
                            ctx.params = p;
                            ctx.query = makeQuery(ctx.url as string, ctx.params);
    
                            if (debounceHandle) clearTimeout(debounceHandle);
                            debounceHandle = setTimeout(async () => {
                                try {
                                    await ctx.fns?.onParams?.(ctx);
                                } catch(err) {
                                    throwQuantum(ctx.el!, err);
                                }
                                if (first) res();
                            }, opts.debounce ?? 100);
                        })
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

