import { Component, h, Element } from '@stencil/core';
import { Context, WatchContext, Get } from 'stencil-quantum';
import { APISchema } from '../api.schema';

@Component({
  tag: 'app-home'
})
export class AppHome {
  @Element() el!: HTMLAppHomeElement;

  @Context() personToGreet = "";

  @WatchContext("personToGreet")
  prepareUserRequest()
  {
    return { id: this.personToGreet.toLowerCase() + ".json" }
  }

  @Get<APISchema>("api", "/user/:id", "prepareUserRequest") user = { name: "Guest" };

  render() {
    return (
      <section class="section">
        <div class="container">
          <h1 class="title">
            Stencil Quantum
          </h1>
          <p>
            Welcome { this.user.name } to the Stencil App Starter.
            You can use this starter to build entire apps all with
            web components using Stencil!
            Check out our docs on <a href='https://stenciljs.com'>stenciljs.com</a> to get started.
          </p>

          <stencil-route-link url='/profile/quantum'>
            <button class="button is-primary">
              Profile page
            </button>
          </stencil-route-link>
        </div>
      </section>
    );
  }
}
