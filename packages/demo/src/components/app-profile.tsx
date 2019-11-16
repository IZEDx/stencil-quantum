import { Component, Prop, h, Element } from '@stencil/core';
import { MatchResults } from '@stencil/router';
import { WatchContext } from "stencil-quantum";

@Component({
  tag: 'app-profile'
})
export class AppProfile 
{
  @Element() el!: HTMLAppProfileElement;
  @Prop() match: MatchResults;

  @WatchContext()
  personToGreet(v: string) {
      console.log("New person to greet", v);
  }

  normalize(name: string): string {
    if (name) {
      return name.substr(0, 1).toUpperCase() + name.substr(1).toLowerCase();
    }
    return '';
  }

  render() {
    if (this.match && this.match.params.name) {
      return (
        <div class="segment">
          <div class="container">
            <div class="content">
              <div class="spacer"></div>
              <h1 class="h1">
                Hello <quantum-consumer name="personToGreet"></quantum-consumer>!
              </h1>
              <p class="p">
                My name is {this.normalize(this.match.params.name)}. My name was passed in
                through a route param!
              </p>
            </div>
          </div>
        </div>
      );
    }
  }
}
