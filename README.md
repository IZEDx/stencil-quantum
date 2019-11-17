

# Stencil Quantum [![npm package](https://badge.fury.io/js/stencil-quantum.svg)](https://badge.fury.io/js/stencil-quantum) ![Built With Stencil](https://img.shields.io/badge/-Built%20With%20Stencil-16161d.svg?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjIuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI%2BCjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI%2BCgkuc3Qwe2ZpbGw6I0ZGRkZGRjt9Cjwvc3R5bGU%2BCjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik00MjQuNywzNzMuOWMwLDM3LjYtNTUuMSw2OC42LTkyLjcsNjguNkgxODAuNGMtMzcuOSwwLTkyLjctMzAuNy05Mi43LTY4LjZ2LTMuNmgzMzYuOVYzNzMuOXoiLz4KPHBhdGggY2xhc3M9InN0MCIgZD0iTTQyNC43LDI5Mi4xSDE4MC40Yy0zNy42LDAtOTIuNy0zMS05Mi43LTY4LjZ2LTMuNkgzMzJjMzcuNiwwLDkyLjcsMzEsOTIuNyw2OC42VjI5Mi4xeiIvPgo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNNDI0LjcsMTQxLjdIODcuN3YtMy42YzAtMzcuNiw1NC44LTY4LjYsOTIuNy02OC42SDMzMmMzNy45LDAsOTIuNywzMC43LDkyLjcsNjguNlYxNDEuN3oiLz4KPC9zdmc%2BCg%3D%3D&colorA=16161d&style=flat-square)

## Experience the quantum realm of stencil.

Stencil Quantum is [Stencil](https://stenciljs.com/) library enabling inexplicit context access. Think of this like passing props down a quantum tunnel instead of explicitly passing them to each child. During that, Stencil Quantum adheres to the basic principles of Stencil Components where data is always passed down the tree and not up. To push data up the tree, Stencil offers Events, which support event bubbling, enabling events to be emitted up the tree multiple levels and to be listened on inexplicitly using the [Listen](https://stenciljs.com/docs/events#listen-decorator) decorator. Stencil Quantums initial goal was to provide this functionality in the other direction.

It serves a similar purpose as [stencil-state-tunnel](https://github.com/ionic-team/stencil-state-tunnel) or [stencil-context](https://www.npmjs.com/package/stencil-context), although with less overhead.

Originally Stencil Quantum was intended to be called Stencil Context, however stencil-context was taken on npm just two weeks prior to the first prototype of this library. This, however, turned out to be quite fortunate considering that [stencil-context](https://www.npmjs.com/package/stencil-context) aims to replicate [react-context](https://reactjs.org/docs/context.html), whereas Stencil Quantum takes a more inexplicit approach, which both fit better.

The demo app, hosted via github pages, can be visited here: https://quantum.ized.io/

---

## The Quantum Realm

The quantum realm (or just context) simply describes arrays of [Providers]() that live on the HTMLElement in the DOM instead of the Stencil Component. This allows children multiple levels down the tree to traverse the tree back up and find the first provider that matches the key they're looking for. Then they can listen for changes and re-render.

Most of this functionality is wrapped up in different decorators, which can then be used reactively similarly to the known Stencil decorators.

Additionally there are some Stencil Components allowing context to be provided and consumed directly from JSX.

---

## Decorators

All decorators are reactive in a stencil sense, meaning they trigger a re-render if their values change. If you set the value on a providing component, then all child components that use it will be re-rendered.

In order to use these decorators, your Stencil component also needs to have their HTMLElement defined as "el", using ```@Element()```, since Stencil Quantum needs to access the DOM (it's the "Quantum Realm" duh).

### Basic Decorators

If the key on these decorators is undefined, the property's name will be used instead.

#### Property Decorators:

- ```@Provide(key?: string|symbol)```: Provides a value to the context
- ```@Context(key?: string|symbol)```: Retrieves a value from the context

#### Method Decorators:

- ```@WatchContext(key?: string|symbol)```: This method will be called when the context updates

### Advanced Decorators

There are also some advanced decorators that rely on the context, but provide extra functionality or functionality that depends on other libraries.

#### Axios

The axios decorators are property decorators and support [restyped](https://github.com/rawrmaan/restyped) schemas as the first type argument to allow the typescript service to suggest urls.

##### @Get<Schema>(axiosKey: string, url: string, paramsKey?: string)
###### Property Decorator

Fetches the given url via and axios instance available in the context on axiosKey. The url can contain path arguments that can be filled in using a params object available in the context on paramsKey, if given. Additional parameters that do not fit in the path will be passed as query arguments.

##### @Put<Schema>(axiosKey: string, url: string, paramsKey?: string, responseKey?: string)
###### Property Decorator

Put works similar to Get, but sends a PUT request when the property is set witht he value as body. The response will be provided as responseKey, if given. 

##### @Rest<Schema>(axiosKey: string, url: string, paramsKey?: string, responseKey?: string)
###### Property Decorator

Rest combines Get and Put. It gets the Rest object first and then sends PUT requests when the property set, to update it. Ideally it's able to bind a property to REST object.

#### Error

There is an error handling built into Quantum, that can be leveraged using these decorators. Additional you can throw an error to Quantum using ```throwQuantum(el: HTMLElement, error: Error)```.

##### @Throw()
###### Property Decorator

Setting this property will throw the value to Quantum.

##### @ContextError()
###### Property Decorator

Receives Quantum errors thrown at the same or any child elements.

##### @Catch()
###### Method Decorator

Catches Quantum errors thrown at the same or any child elements.

#### Event

The event decorators allow to interact with abstract EventEmitters in the context. Initially this was made to interact with a Socket.io instance. An abstract EventEmitter looks like this:

```typescript
export interface EventEmitter
{
    emit(event: string, ...args: any[]): EventEmitter;
    on(event: string, fn: (...args: any[]) => any): EventEmitter;
    once(event: string, fn: (...args: any[]) => any): EventEmitter;
    off(event: string, fn: (...args: any[]) => any): EventEmitter;
}
```

##### @Emit<T extends EventEmitter>(emitterKey: string, event? Event) // with Event being the name of the event as string
###### Property Decorator

Emits the given value to the EventEmitter found in the context as emitterKey for the given event name.


##### @Receive<T extends EventEmitter>(emitterKey: string, event? Event) // with Event being the name of the event as string
###### Property Decorator

Updates with values emitted by the EventEmitter found in the context as emitterKey for the event name.

### Example

#### my-component.tsx

```tsx
import { Component, h, Element } from "@stencil/core";
import { Provide } from "stencil-quantum";

@Component({
    tag: "my-component"
})
export class MyComponent 
{
    @Element() el: HTMLStencilElement;

    @Provide() greeting = "World";

    render() {
        return <div>
            <h1>My Component</h1>
            <greet-comp></greet-comp>
        </div>
    }
}
```

#### greet-comp.tsx

```tsx
import { Component, h, Element } from "@stencil/core";
import { Context } from "stencil-quantum";

@Component({
    tag: "greet-comp"
})
export class GreetComp 
{
    @Element() el: HTMLStencilElement;

    @Context() greeting!: string;

    render() {
        return <div>
            Hello {this.greeting}
        </div>;
    }
}
```

---

## Components

Stencil Quantum also comes with two components to provide and consume data. Data provided by a decorator can be consumed with a quantum-component and vice versa.

### Example

#### my-component.tsx
```tsx
import { Component, h, State } from "@stencil/core";
import "stencil-quantum";

@Component({
    tag: "my-component",
})
export class MyComponent 
{
    @State() johnTimer = 0;
    @State() kevinTimer = 0;

    componentWillLoad()
    {
        setInterval(() => this.johnTimer++, 1000);
        setInterval(() => this.kevinTimer++, 2000);
    }

    render() {
        return <div>
            <h1>My Component</h1>
            <quantum-provider name="greeting" value={"John " + this.johnTimer}>
                <greet-comp></greet-comp>
            </quantum-provider>
            <br />
            <quantum-provider name="greeting" value={"Kevin " + this.kevinTimer}>
                <greet-comp></greet-comp>
            </quantum-provider>
        </div>
    }
}
```

#### greet-comp.tsx
```tsx
import { Component, h } from "@stencil/core";
import "stencil-quantum";

@Component({
    tag: "greet-comp"
})
export class GreetComp 
{
    render() {
        return <div>
            Hello <quantum-consumer name="greeting"></quantum-consumer>
        </div>;
    }
}
```

---

## Manual

Internally the consumer and provider components use the following functions.

### Example

#### my-component.tsx
```tsx
import { Component, h, Element } from "@stencil/core";
import { Provider } from "stencil-quantum";

@Component({
    tag: "my-component",
})
export class MyComponent 
{
    @Element() el: HTMLStencilElement;

    componentWillLoad()
    {
        const provider = Provider.create(this.el, "greeting", 0);
        
        // These two are equivalent
        setInterval(() => provider.update(v => v + 1), 1000); 
        // setInterval(() => provider.provide(provider.retrieve() + 1), 1000);
    }

    render() {
        return <div>
            <h1>My Component</h1>
            <greet-comp></greet-comp>
        </div>
    }
}
```

#### greet-comp.tsx
```tsx
import { Component, h, Element, State } from "@stencil/core";
import { Provider } from "stencil-quantum";

@Component({
    tag: "greet-comp"
})
export class GreetComp 
{
    @Element() el!: HTMLGreetCompElement;
    @State() greeting!: string;

    componentWillLoad()
    {
        const provider = Provider.find(this.el, "greeting");
        provider.listen(v => this.greeting = v);
    }

    render() {
        return <div>
            Hello {this.greeting}
        </div>;
    }
}
```
