import { Component, h, Element } from '@stencil/core';
import { Provide } from 'stencil-quantum';

@Component({
  tag: 'app-root',
  styleUrl: 'app-root.css'
})
export class AppRoot 
{
  @Element() el!: HTMLAppRootElement;
  @Provide() personToGreet = "Your Name";
  
  render() {
    return (
      <div>
        <header>
          <h1>Stencil App Starter</h1>
        </header>
        <input placeholder="Your Name" value={this.personToGreet} onChange={e => this.personToGreet = e.target["value"]}></input>
        <main>
          <stencil-router>
            <stencil-route-switch scrollTopOffset={0}>
              <stencil-route url='/' component='app-home' exact={true} />
              <stencil-route url='/profile/:name' component='app-profile' />
            </stencil-route-switch>
          </stencil-router>
        </main>
      </div>
    );
  }
}
