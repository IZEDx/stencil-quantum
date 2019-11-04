import { Component, h, State, Element } from '@stencil/core';
import { Provide } from '../../context';

@Component({
	tag: 'my-component',
	styleUrl: 'my-component.css'
})
export class MyComponent 
{
	@Element() el: HTMLElement;

	@Provide("greeting") defaultGreeting = "Welt";
	@State() hansTimer = 0;
	@State() dieterTimer = 0;

	componentWillLoad()
	{
		setInterval(() => this.hansTimer++, 1000);
		setInterval(() => this.dieterTimer++, 2000);
		setInterval(() => this.defaultGreeting += ".", 3000);
	}

	render() {
		return <div>
			<h1>My Component</h1>
			<greet-comp></greet-comp>
			<br />
			<ctx-provider name="greeting" value={"Hans " + this.hansTimer}>
				<greet-comp></greet-comp>
			</ctx-provider>
			<br />
			<ctx-provider name="greeting" value={"Dieter " + this.dieterTimer}>
				<greet-comp></greet-comp>
			</ctx-provider>
		</div>
	}
}
