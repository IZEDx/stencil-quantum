import { Component, h } from '@stencil/core';

@Component({
	tag: 'my-component',
	styleUrl: 'my-component.css'
})
export class MyComponent 
{
	render() {
		return <div>
			<h1>My Component</h1>
			<ctx-provider name="greeting" value="Hans">
				<greet-comp></greet-comp>
			</ctx-provider>
			<br />
			<ctx-provider name="greeting" value="Dieter">
				<greet-comp></greet-comp>
			</ctx-provider>
		</div>
	}
}
