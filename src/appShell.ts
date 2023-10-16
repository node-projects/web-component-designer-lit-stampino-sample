import { BaseCustomWebcomponentBindingsService, JsonFileElementsService, PropertyGrid, DocumentContainer, CopyPasteAsJsonService, DebugView, sleep } from '@node-projects/web-component-designer';
import createDefaultServiceContainer from '@node-projects/web-component-designer/dist/elements/services/DefaultServiceBootstrap.js';

import { NodeHtmlParserService } from '@node-projects/web-component-designer-htmlparserservice-nodehtmlparser';
import { CodeViewMonaco } from '@node-projects/web-component-designer-codeview-monaco';
import { CssToolsStylesheetService } from '@node-projects/web-component-designer-stylesheetservice-css-tools';

import '@node-projects/web-component-designer-widgets-wunderbaum';
import { PaletteTreeView, BindableObjectsBrowser, TreeViewExtended } from '@node-projects/web-component-designer-widgets-wunderbaum/';

let serviceContainer = createDefaultServiceContainer();
serviceContainer.register("bindingService", new BaseCustomWebcomponentBindingsService());
let rootDir = "/web-component-designer-demo";
if (window.location.hostname == 'localhost' || window.location.hostname == '127.0.0.1')
  rootDir = '';
serviceContainer.register("htmlParserService", new NodeHtmlParserService((di) => {
  if (di.name == 'template')
    di.setView(document.createElement('div'));
}));
serviceContainer.register("copyPasteService", new CopyPasteAsJsonService());
serviceContainer.register("bindableObjectsService", new CustomBindableObjectsService());

serviceContainer.config.codeViewWidget = CodeViewMonaco;

//Instance Service Container Factories
serviceContainer.register("stylesheetService", designerCanvas => new CssToolsStylesheetService(designerCanvas));

import { DockSpawnTsWebcomponent } from 'dock-spawn-ts/lib/js/webcomponent/DockSpawnTsWebcomponent.js';
import { DockManager } from 'dock-spawn-ts/lib/js/DockManager.js';
import { BaseCustomWebComponentConstructorAppend, css, Disposable, html } from '@node-projects/base-custom-webcomponent';
import { TextEditor } from './textEditor.js';
import './textEditor.js';
import { StampinoRenderer } from './stampinoRenderer.js';
import './stampinoRenderer.js';
import { CustomBindableObjectsService } from './services/CustomBindableObjectsService.js';
import { CustomBindableObjectDragDropService } from './services/CustomBindableObjectDragDropService.js';

DockSpawnTsWebcomponent.cssRootDirectory = "./node_modules/dock-spawn-ts/lib/css/";

export class AppShell extends BaseCustomWebComponentConstructorAppend {
  activeElement: HTMLElement;
  mainPage = 'designer';

  private _dock: DockSpawnTsWebcomponent;
  private _dockManager: DockManager;
  _paletteTree: PaletteTreeView;
  _bindableObjectsBrowser: BindableObjectsBrowser
  _propertyGrid: PropertyGrid;
  _debugView: DebugView;
  _treeViewExtended: TreeViewExtended;
  _styleEditor: TextEditor;
  _jsonEditor: TextEditor;
  _stampinoRenderer: StampinoRenderer;

  static readonly style = css`
    :host {
      display: block;
      box-sizing: border-box;
      position: relative;

      /* Default colour scheme */
      --canvas-background: white;
      --almost-black: #141720;
      --dark-grey: #232733;
      --medium-grey: #2f3545;
      --light-grey: #383f52;
      --highlight-pink: #e91e63;
      --highlight-blue: #2196f3;
      --highlight-green: #99ff33;
      --input-border-color: #596c7a;
    }

    .app-header {
      background-color: var(--almost-black);
      color: white;
      height: 60px;
      width: 100%;
      position: fixed;
      z-index: 100;
      display: flex;
      font-size: var(--app-toolbar-font-size, 20px);
      align-items: center;
      font-weight: 900;
      letter-spacing: 2px;
      padding-left: 10px;
    }

    .app-body {
      box-sizing: border-box;
      display: flex;
      flex-direction: row;
      height: 100%;
      overflow: hidden;
    }

    .heavy {
      font-weight: 900;
      letter-spacing: 2px;
    }
    .lite {
      font-weight: 100;
      opacity: 0.5;
      letter-spacing: normal;
    }

    dock-spawn-ts > div {
      height: 100%;
    }

    attribute-editor {
      height: 100%;
      width: 100%;
    }
    `;

  static readonly template = html`
      <div class="app-body">
        <dock-spawn-ts id="dock" style="width: 100%; height: 100%; position: relative;">
          <div id="treeUpper" title="Palette" dock-spawn-dock-type="left" dock-spawn-dock-ratio="0.2"
            style="z-index: 1; position: relative; overflow: hidden; width: 100%; height: 100%; display: flex; flex-direction: column;">
            <node-projects-palette-tree-view name="paletteTree" id="paletteTree" style="height: 100%;"></node-projects-palette-tree-view>   
          </div>
      
          <div id="upper3" title="Bind" dock-spawn-dock-to="treeUpper" style="overflow: hidden; width: 100%;">
            <node-projects-bindable-objects-browser id="bindableObjectsBrowser"></node-projects-bindable-objects-browser>
          </div>

          <div title="TreeExtended" dock-spawn-dock-type="down" dock-spawn-dock-to="treeUpper" dock-spawn-dock-ratio="0.5"
            style="overflow: hidden; width: 100%;">
            <node-projects-tree-view-extended name="tree" id="treeViewExtended"></node-projects-tree-view-extended>
          </div>
      
          <div id="attributeDock" title="Properties" dock-spawn-dock-type="right" dock-spawn-dock-ratio="0.2">
            <node-projects-property-grid-with-header id="propertyGrid"></node-projects-property-grid-with-header>
          </div>

          <div id="debugDock" title="Debug" dock-spawn-dock-type="down" dock-spawn-dock-to="attributeDock" dock-spawn-dock-ratio="0.2">
            <node-projects-debug-view id="debugView"></node-projects-debug-view>
          </div>

          <div id="lowerdata" title="data" dock-spawn-dock-type="down" dock-spawn-dock-ratio="0.4" style="overflow: hidden; width: 100%;">
            <node-projects-text-editor language="json" id="jsonEditor"></node-projects-text-editor>
          </div>

          <div id="lower" dock-spawn-dock-to="lowerdata" title="stylesheet.css" dock-spawn-dock-type="down" dock-spawn-dock-ratio="0.2" style="overflow: hidden; width: 100%;">
            <node-projects-text-editor id="styleEditor"></node-projects-text-editor>
          </div>

          <div id="lower" title="stylesheet.css" dock-spawn-dock-type="right" dock-spawn-dock-ratio="0.3" style="overflow: hidden; width: 100%;">
            <node-projects-stampino-renderer id="stampinoRenderer"></node-projects-stampino-renderer>
          </div>
        </dock-spawn-ts>
      </div>
    `;
  private _styleChangedCb: Disposable;

  async ready() {
    this._dock = this._getDomElement('dock');
    this._paletteTree = this._getDomElement<PaletteTreeView>('paletteTree');
    this._bindableObjectsBrowser = this._getDomElement<BindableObjectsBrowser>('bindableObjectsBrowser');
    this._treeViewExtended = this._getDomElement<TreeViewExtended>('treeViewExtended');
    this._propertyGrid = this._getDomElement<PropertyGrid>('propertyGrid');
    this._debugView = this._getDomElement<DebugView>('debugView');
    this._styleEditor = this._getDomElement<TextEditor>('styleEditor');
    this._jsonEditor = this._getDomElement<TextEditor>('jsonEditor');
    this._stampinoRenderer = this._getDomElement<StampinoRenderer>('stampinoRenderer');

    this._dockManager = this._dock.dockManager;

    this._dockManager.addLayoutListener({
      onActiveDocumentChange: (manager, panel) => {
        if (panel) {
          let element = this._dock.getElementInSlot((<HTMLSlotElement><any>panel.elementContent));
          if (element && element instanceof DocumentContainer) {
            let sampleDocument = element as DocumentContainer;
            this._styleEditor.model = sampleDocument.additionalData.model;
            this._propertyGrid.instanceServiceContainer = sampleDocument.instanceServiceContainer;
            this._treeViewExtended.instanceServiceContainer = sampleDocument.instanceServiceContainer;
            sampleDocument.instanceServiceContainer.selectionService.onSelectionChanged.on(e => {
              this._debugView.update(e.selectedElements[0]);
            });
          }
        }
      },
      onClosePanel: (manager, panel) => {
        if (panel) {
          let element = this._dock.getElementInSlot((<HTMLSlotElement><any>panel.elementContent));
          if (element && element instanceof DocumentContainer) {
            (<DocumentContainer>element).dispose();
            if (this._styleChangedCb)
              this._styleChangedCb.dispose();
            this._styleChangedCb = null;
          }
        }
      }
    });

    await this._setupServiceContainer();
    this._bindableObjectsBrowser.initialize(serviceContainer);

    this.openDocument();

    await sleep(200)
    this.activateDockById('treeUpper');
  }

  private async _setupServiceContainer() {
    serviceContainer.register('elementsService', new JsonFileElementsService('native', rootDir + '/node_modules/@node-projects/web-component-designer/config/elements-native.json'));
    serviceContainer.register('bindableObjectsService', new CustomBindableObjectsService());
    serviceContainer.register('bindableObjectDragDropService', new CustomBindableObjectDragDropService());

    serviceContainer.globalContext.onToolChanged.on((e) => {
      let name = [...serviceContainer.designerTools.entries()].filter(({ 1: v }) => v === e.newValue.tool).map(([k]) => k)[0];
      if (e.newValue == null)
        name = "Pointer"
      const buttons = Array.from<HTMLButtonElement>(document.getElementById('tools').querySelectorAll('[data-command]'));
      for (const b of buttons) {
        if (b.dataset.commandParameter == name)
          b.style.backgroundColor = "green"
        else
          b.style.backgroundColor = ""
      }
    });

    this._paletteTree.loadControls(serviceContainer, serviceContainer.elementsServices);
    this._propertyGrid.serviceContainer = serviceContainer;
  }

  public async openDocument() {
    let style = await (await fetch('../assets/demo-stylesheet.css')).text();
    let code = await (await fetch('../assets/demo-template.html')).text();
    let data = await (await fetch('../assets/demo-data.json')).text();

    let sampleDocument = new DocumentContainer(serviceContainer);
    sampleDocument.setAttribute('dock-spawn-panel-type', 'document');
    sampleDocument.setAttribute('dock-spawn-hide-close-button', '');
    sampleDocument.title = "stampino template";
    sampleDocument.additionalStylesheets = [
      {
        name: "stylesheet.css",
        content: style
      }
    ];
    const model = this._styleEditor.createModel(sampleDocument.additionalStylesheets[0].content);
    sampleDocument.additionalData = { model: model };

    const jsonmodel = this._jsonEditor.createModel(data);
    this._jsonEditor.model = jsonmodel;

    this._stampinoRenderer.getRenderData = () => {
      return { data: jsonmodel.getValue(), template: sampleDocument.content }
    };

    sampleDocument.onContentChanged.on(() => {
      this._stampinoRenderer.render();
    });

    let timer;
    let disableTextChangedEvent = false;
    model.onDidChangeContent((e) => {
      if (!disableTextChangedEvent) {
        if (timer)
          clearTimeout(timer)
        timer = setTimeout(() => {
          sampleDocument.additionalStylesheets = [
            {
              name: "stylesheet.css",
              content: model.getValue()
            }
          ];
          timer = null;
        }, 250);
      }
    });
    sampleDocument.additionalStylesheetChanged.on(() => {
      disableTextChangedEvent = true;
      if (model.getValue() !== sampleDocument.additionalStylesheets[0].content)
        model.applyEdits([{ range: model.getFullModelRange(), text: sampleDocument.additionalStylesheets[0].content, forceMoveMarkers: true }]);
      disableTextChangedEvent = false;
    });

    sampleDocument.tabIndex = 0;
    sampleDocument.addEventListener('keydown', (e) => {
      if (e.key == "Escape") {
        e.stopPropagation();
      }
    }, true);
    this._dock.appendChild(sampleDocument);

    if (code) {
      sampleDocument.content = code;
    }
  }

  activateDockById(name: string) {
    this.activateDock(this._getDomElement(name));
  }

  activateDock(element: Element) {
    const nd = this._dockManager.getNodeByElement(element);
    nd.parent.container.setActiveChild(nd.container);
  }
}

window.customElements.define('node-projects-app-shell', AppShell);