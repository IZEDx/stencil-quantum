import { Component, h } from '@stencil/core';
import { Provide } from '../../context';

@Component({
  tag: 'my-component',
  styleUrl: 'my-component.css',
  shadow: true
})
export class MyComponent {
 
  @Provide() test: string = "initial";

  componentWillLoad() {
    let i = 0;
    setInterval(() => this.test = i++ + " seconds", 1000);
  }
  
  render() {
    return <div>My component <test-comp></test-comp></div>;
  }
}
