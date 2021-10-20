

# Stencil Quantum [![npm package](https://badge.fury.io/js/stencil-quantum.svg)](https://badge.fury.io/js/stencil-quantum) ![Built With Stencil](https://img.shields.io/badge/-Built%20With%20Stencil-16161d.svg?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjIuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI%2BCjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI%2BCgkuc3Qwe2ZpbGw6I0ZGRkZGRjt9Cjwvc3R5bGU%2BCjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik00MjQuNywzNzMuOWMwLDM3LjYtNTUuMSw2OC42LTkyLjcsNjguNkgxODAuNGMtMzcuOSwwLTkyLjctMzAuNy05Mi43LTY4LjZ2LTMuNmgzMzYuOVYzNzMuOXoiLz4KPHBhdGggY2xhc3M9InN0MCIgZD0iTTQyNC43LDI5Mi4xSDE4MC40Yy0zNy42LDAtOTIuNy0zMS05Mi43LTY4LjZ2LTMuNkgzMzJjMzcuNiwwLDkyLjcsMzEsOTIuNyw2OC42VjI5Mi4xeiIvPgo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNNDI0LjcsMTQxLjdIODcuN3YtMy42YzAtMzcuNiw1NC44LTY4LjYsOTIuNy02OC42SDMzMmMzNy45LDAsOTIuNywzMC43LDkyLjcsNjguNlYxNDEuN3oiLz4KPC9zdmc%2BCg%3D%3D&colorA=16161d&style=flat-square)

## Experience the quantum realm of stencil.

Stencil Quantum is [Stencil](https://stenciljs.com/) library enabling inexplicit context access. Think of this like passing props down a quantum tunnel instead of explicitly passing them to each child. During that, Stencil Quantum adheres to the basic principles of Stencil Components where data is always passed down the tree and not up. To push data up the tree, Stencil offers Events, which support event bubbling, enabling events to be emitted up the tree multiple levels and to be listened on inexplicitly using the [Listen](https://stenciljs.com/docs/events#listen-decorator) decorator. Stencil Quantums initial goal was to provide this functionality in the other direction.

It serves a similar purpose as [stencil-state-tunnel](https://github.com/ionic-team/stencil-state-tunnel) or [stencil-context](https://www.npmjs.com/package/stencil-context), although with less overhead.

Originally Stencil Quantum was intended to be called Stencil Context, however stencil-context was taken on npm just two weeks prior to the first prototype of this library. This, however, turned out to be quite fortunate considering that [stencil-context](https://www.npmjs.com/package/stencil-context) aims to replicate [react-context](https://reactjs.org/docs/context.html), whereas Stencil Quantum takes a more inexplicit approach, which both fit better.

---

## The Quantum Realm

The quantum realm (or just context) simply describes arrays of [Providers]() that live on the HTMLElement in the DOM instead of the Stencil Component. This allows children multiple levels down the tree to traverse the tree back up and find the first provider that matches the key they're looking for. Then they can listen for changes and re-render.

Most of this functionality is wrapped up in different decorators, which can then be used reactively similarly to the known Stencil decorators.

Additionally there are some Stencil Components allowing context to be provided and consumed directly from JSX.
