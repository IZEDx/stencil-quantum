[![npm package](https://badge.fury.io/js/stencil-quantum.svg)](https://badge.fury.io/js/stencil-quantum) ![Built With Stencil](https://img.shields.io/badge/-Built%20With%20Stencil-16161d.svg?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjIuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI%2BCjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI%2BCgkuc3Qwe2ZpbGw6I0ZGRkZGRjt9Cjwvc3R5bGU%2BCjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik00MjQuNywzNzMuOWMwLDM3LjYtNTUuMSw2OC42LTkyLjcsNjguNkgxODAuNGMtMzcuOSwwLTkyLjctMzAuNy05Mi43LTY4LjZ2LTMuNmgzMzYuOVYzNzMuOXoiLz4KPHBhdGggY2xhc3M9InN0MCIgZD0iTTQyNC43LDI5Mi4xSDE4MC40Yy0zNy42LDAtOTIuNy0zMS05Mi43LTY4LjZ2LTMuNkgzMzJjMzcuNiwwLDkyLjcsMzEsOTIuNyw2OC42VjI5Mi4xeiIvPgo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNNDI0LjcsMTQxLjdIODcuN3YtMy42YzAtMzcuNiw1NC44LTY4LjYsOTIuNy02OC42SDMzMmMzNy45LDAsOTIuNywzMC43LDkyLjcsNjguNlYxNDEuN3oiLz4KPC9zdmc%2BCg%3D%3D&colorA=16161d&style=flat-square)

# Stencil Quantum

Stencil Quantum serves a similar purpose as [stencil-state-tunnel](https://github.com/ionic-team/stencil-state-tunnel) or [stencil-context](https://www.npmjs.com/package/stencil-context), although with less overhead.
It provides a way to inexplicitly pass props down the DOM-tree. 
This context state can be accessed in three different ways, via decorators, components or manually.

## Decorators

Stencil Quantum adds two property decorators: ```@Provide()``` and ```@Context()```.
Use ```@Provide()``` to provide data to the context (and all children in the tree) and ```@Context()``` to access the value of the first parent in the tree, that provides it.

Both decorators take an optional "key" argument, if none is passed, the propertyKey will be used.

Both decorators are reactive in a stencil sense, meaning they trigger a re-render if their values change. If you set the value on a providing component, then all child components that use it will be re-rendered.

In order to use these decorators, your Stencil component also needs to have their HTMLElement defined as "el", using ```@Element()```, since Stencil Quantum needs to access the DOM to determine the scopes.

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

## Manual

Internally the consumer and provider components use the following functions.

### Example

#### my-component.tsx
```tsx
import { Component, h, Element } from "@stencil/core";
import { createProvider } from "stencil-quantum";

@Component({
    tag: "my-component",
})
export class MyComponent 
{
    @Element() el: HTMLStencilElement;

    componentWillLoad()
    {
        const provider = createProvider(this.el, "greeting", 0);
        
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
import { findProvider } from "stencil-quantum";

@Component({
    tag: "greet-comp"
})
export class GreetComp 
{
    @Element() el!: HTMLGreetCompElement;
    @State() greeting!: string;

    componentWillLoad()
    {
        const provider = findProvider(this.el, "greeting");
        provider.listen(v => this.greeting = v);
    }

    render() {
        return <div>
            Hello {this.greeting}
        </div>;
    }
}
```
