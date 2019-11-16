import { Component, h } from '@stencil/core';

@Component({
  tag: 'app-home'
})
export class AppHome {

  render() {
    return (
      <section class="section">
        <div class="container">
          <h1 class="title">
            Stencil Quantum
          </h1>
          <p>
            Welcome to the Stencil App Starter.
            You can use this starter to build entire apps all with
            web components using Stencil!
            Check out our docs on <a href='https://stenciljs.com'>stenciljs.com</a> to get started.
          </p>

          <stencil-route-link url='/profile/stencil'>
            <button class="button is-primary">
              Profile page
            </button>
          </stencil-route-link>
        </div>
      </section>
    );
  }
}
