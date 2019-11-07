import { Component, h, State, Element } from '@stencil/core';
import { Provide } from '../../libs/context';

@Component({
	tag: 'ctx-test-comp',
})
export class CtxTestComp 
{
	@Element() el!: HTMLCtxTestCompElement;

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
			<ctx-greet-comp></ctx-greet-comp>
			<br />
			<ctx-provider name="greeting" value={"Hans " + this.hansTimer}>
				<ctx-greet-comp></ctx-greet-comp>
			</ctx-provider>
			<br />
			<ctx-provider name="greeting" value={"Dieter " + this.dieterTimer}>
				<ctx-greet-comp></ctx-greet-comp>
			</ctx-provider>
		</div>
	}
}
