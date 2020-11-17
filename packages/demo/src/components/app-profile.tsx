import { Component, Prop, h, Element } from '@stencil/core';
import { MatchResults } from '@stencil/router';
import { normalize } from '../libs/utils';
import { demo } from '../context/demo';

@Component({
  tag: 'app-profile'
})
export class AppProfile 
{
  @Element() el!: HTMLAppProfileElement;
  @Prop() match: MatchResults;

  @demo.Observe("personToGreet")
  personToGreet(v: string) {
      console.log("New person to greet", v);
  }

  render() {
    if (this.match && this.match.params.name) {
      return (
        <section class="section">
          <div class="container">
            <h1 class="title">
              Hello <quantum-display bind={demo.get("personToGreet")} name="" namespace="" debug={true}></quantum-display>!
            </h1>
            <p>
              My name is {normalize(this.match.params.name)}. My name was passed in
              through a route param!
            </p>
            <p>Code of this page:</p>
            <img src="/assets/profile-code.png"></img>
          </div>
        </section>
      );
    }
  }
}
 