import { Component, h, Element, Listen } from '@stencil/core';
import { Provide, log, ContextError, QuantumError } from 'stencil-quantum';
import axios from "restyped-axios";
import { APISchema } from '../api.schema';

log.debug = true;

const demoNames = [
	"Alice", "Bob", "Cindy", "Danny", "Erica", "Felix"
]

@Component({
 	tag: 'app-root'
})
export class AppRoot 
{
	@Element() el!: HTMLAppRootElement;
	@Provide() personToGreet = "Your Name";
	hasCustomName = false;
	demoNameIndex = -1;

	@Provide() api = axios.create<APISchema>({baseURL: "/assets/api/"});

	@ContextError() error!: QuantumError;

	@Listen("changeName") 
	onChangeName({detail}: {detail: string})
	{
		console.log("Changing name to: ", detail);
		this.personToGreet = detail;
		this.hasCustomName = true;
	}

	componentDidLoad() 
	{
		this.demoNameChanger();
	}

	demoNameChanger()
	{
		if (this.hasCustomName) return;
		this.demoNameIndex = ++this.demoNameIndex % demoNames.length;
		this.personToGreet = demoNames[this.demoNameIndex];
		setTimeout(() => this.demoNameChanger(), 2000);
	}

	render() 
	{
		return (
			<div>
				<app-nav></app-nav>
				{ !this.error ? "" :
					<section class="section">
						<div class="container">
							<div class="notification is-danger">
								<button class="delete" onClick={() => this.error = undefined}></button>
								{this.error?.message}
							</div>
						</div>
					</section>
				}
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