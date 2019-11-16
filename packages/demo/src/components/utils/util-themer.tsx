import { Component, h, State, Watch, Prop, Event, EventEmitter } from '@stencil/core';

interface Theme {
    name: string;
    css: string;
    thumb: string;
}

@Component({
    tag: "util-themer"
})
export class UtilThemer {
    
    @Prop() active = false;
    @Prop() thumbSize = 142;
    @Prop() thumbScale = 0.42;
    @Prop() url = "https://jenil.github.io/bulmaswatch/api/themes.json";
    
    @State() themes: Theme[] = [];
    @State() selectedTheme = -1;
    @Event() selectTheme!: EventEmitter<string>;
    @Event() closeThemer!: EventEmitter<void>;

    themeEl = document.createElement("link");

    async componentWillLoad()
    {
        this.themes = (await (await fetch(this.url)).json()).themes;
        
        this.themeEl.setAttribute("rel", "stylesheet");
        this.themeEl.setAttribute("href", this.themes[0].css);
        document.head.appendChild(this.themeEl);

        if (localStorage.getItem("theme"))
        {
            this.selectedTheme = this.themes.findIndex(t => t.name === localStorage.getItem("theme"));
        }
        else 
        {
            this.selectedTheme = 0;
        }
    }

    get theme() {
        return this.themes[this.selectedTheme];
    }

    get style() {
        const size = this.thumbSize+"px";
        const minSize = (this.thumbSize / this.thumbScale)+"px";
        return {
            themePreview: {
                overflow: "hidden",
                height: size,
                width: size
            },
            iframe: {
                "transform":                `scale(${this.thumbScale})`,
                "transform-origin":         "0 0",
                "-moz-transform":           `scale(${this.thumbScale})`,
                "-moz-transform-origin":    "0 0",
                "-o-transform":             `scale(${this.thumbScale})`,
                "-o-transform-origin":      "0 0",
                "-webkit-transform":        `scale(${this.thumbScale})`,
                "-webkit-transform-origin": "0 0",
                "min-width":                `${minSize}`,
                "min-height":               `${minSize}`, 
                "border":                   "1px solid black",
                "pointer-events":           "none",
            },
            modalCardFoot: {
                "justify-content": "center"
            },
            label: {
                "padding": "10px",
                "padding-right": "17px",
                "padding-bottom": "4px"
            }
        }
    }

    @Watch("selectedTheme")
    onSelectTheme()
    {
        if (this.selectedTheme < 0) this.selectedTheme = 0;
        if (this.selectedTheme >= this.themes.length) this.selectedTheme = this.themes.length - 1;

        console.log("Selected theme", this.theme.name);
        this.themeEl.setAttribute("href", this.theme.css);
        localStorage.setItem("theme", this.theme.name);
        this.selectTheme.emit(this.theme.name);
    }

    render() {
        const style = this.style;
        return (
            <div class={{"modal": true, "is-active": this.active}}>
                <div class="modal-background" onClick={() => this.closeThemer.emit()}></div>
                <div class="modal-card">
                    <header class="modal-card-head">
                        <p class="modal-card-title">Themes</p>
                    </header>
                    <section class="modal-card-body">
                        <util-grid items={this.themes} map={(theme: Theme, i) => (
                            <a class="box" onClick={() => this.selectedTheme = i}>
                                <div class="theme-preview" style={style.themePreview}>
                                    <iframe src={theme.thumb} style={style.iframe}></iframe>
                                </div>
                                <br />
                                <div class="content has-text-centered">
                                    {theme.name}
                                </div>
                            </a>
                        )}></util-grid>
                    </section>
                    <footer class="modal-card-foot" style={style.modalCardFoot}>
                        <a class="button" onClick={() => this.selectedTheme--}>
                            <ion-icon name="arrow-dropleft"></ion-icon>
                        </a>
                        <label class="label" style={style.label}>{this.theme.name}</label>
                        <a class="button" onClick={() => this.selectedTheme++}>
                            <ion-icon name="arrow-dropright"></ion-icon>
                        </a>
                    </footer>
                </div>
                <button class="modal-close is-large" aria-label="close" onClick={() => this.closeThemer.emit()}></button>
            </div>
        );
    }
}