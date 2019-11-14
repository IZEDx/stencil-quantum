import { Component, Prop, h, Element } from '@stencil/core';
import { MatchResults } from '@stencil/router';
import { WatchContext, log } from "stencil-quantum";

@Component({
  tag: 'app-profile',
  styleUrl: 'app-profile.css'
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
        <div class="app-profile">
          <p>
            Hello! My name is {this.normalize(this.match.params.name)}. My name was passed in
            through a route param!
          </p>
          <p>
            I greet you <ctx-consumer name="personToGreet"></ctx-consumer>
          </p>
        </div>
      );
    }
  }
}
