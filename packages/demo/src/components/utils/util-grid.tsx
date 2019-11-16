import { h, Component, Prop } from '@stencil/core';

function* range(from: number, count: number, step = 1)
{
    const to = from + count;
    for (let i = from; i < to; i += step) {
        yield i;
    }
}

@Component({
    tag: 'util-grid'
})
export class UtilGrid {
    
    @Prop() width = 3;
    @Prop() items = [] as any[];
    @Prop() map: (v: any, i: number) => any = () => {};

    render() {
        return (
            <div class="content">
                { [...range(0, this.items.length, this.width)].map(i => 
                    <div class="columns">
                        { [...range(i, this.width)].map(i => 
                            <div class="column">
                                { this.items[i] ? this.map(this.items[i], i) : "" }
                            </div>
                        ) }
                    </div>
                ) } 
            </div>
        );
    }
}