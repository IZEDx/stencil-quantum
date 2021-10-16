import { Component, h, Element } from '@stencil/core';
import { log } from 'stencil-quantum';
import axios from "restyped-axios";
import { APISchema } from '../api.schema';
import { demo } from '../context/demo';

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

	@demo.Provide("personToGreet") personToGreet = "Your Name";


	hasCustomName = false;
	demoNameIndex = -1;
	@demo.Provide("api") api = axios.create<APISchema>({baseURL: "/assets/api/"});

	@demo.Implement("changeName")
	async changeName(name: string)
	{
		this.personToGreet = name;
	}

	componentDidLoad() 
	{
		console.log(this.api);
		//this.demoNameChanger();
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