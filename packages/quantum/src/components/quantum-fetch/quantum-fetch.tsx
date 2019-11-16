import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'quantum-fetch'
})
export class QuantumFetch {

  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }

}
