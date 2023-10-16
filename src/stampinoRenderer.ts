import { BaseCustomWebComponentConstructorAppend, html } from "@node-projects/base-custom-webcomponent";
import * as stampino from 'stampino';
import { render } from 'lit';

export class StampinoRenderer extends BaseCustomWebComponentConstructorAppend {

    static readonly template = html``;

    getRenderData: () => { template: string, data: string };

    constructor() {
        super();
        this._restoreCachedInititalValues();
    }

    render() {
        const data = this.getRenderData();
        const d = document.createElement('div');
        d.innerHTML = data.template;
        const myTemplate = stampino.prepareTemplate(<HTMLTemplateElement>d.children[0]);
        render(myTemplate(JSON.parse(data.data)), this.shadowRoot);
    }
}

customElements.define('node-projects-stampino-renderer', StampinoRenderer);