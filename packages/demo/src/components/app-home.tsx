import { Component, h, Element } from '@stencil/core';
import { Get, Entanglement, qt } from 'stencil-quantum';
import { APISchema } from '../api.schema';
import { demo } from '../context/demo';

const q = new Entanglement(
{
  userParams: qt<{id: string}>()
})

@Component({
  tag: 'app-home'
})
export class AppHome {
  @Element() el!: HTMLAppHomeElement;

  @demo.Context("personToGreet") personToGreet!: string;

  @demo.React("personToGreet", q, "userParams")
  prepareUserParams(name: string)
  {
    console.log("preparing", name);
    return { id: name.toLowerCase() + ".json" }
  }
  
  @Get<APISchema>({ url: "/user/:id",  axios: "api",  params: "userParams" }) user = { name: "Guest" };

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
