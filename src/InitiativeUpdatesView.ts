import { App, ItemView, MarkdownRenderer, MarkdownView, Notice, Vault, WorkspaceLeaf } from "obsidian";
import { Customers } from "./Customers";
import { CustomerTrackerSettings } from "./Settings";
import { getLinesOfHeader } from "./Utils";

export const INITIATIVEUPDATES_VIEW_TYPE = "initiative-updates-view";

export class InitiativeUpdatesView extends ItemView {

    app: App;
    customers: Customers;
    settings: CustomerTrackerSettings;

    constructor(leaf: WorkspaceLeaf, app: App, customers: Customers, settings: CustomerTrackerSettings) {
        super(leaf);
        this.app = app;
        this.customers = customers;
        this.settings = settings;
    }

    getViewType() {
        return INITIATIVEUPDATES_VIEW_TYPE;
    }

    getDisplayText() {
        return "Initiative updates view";
    }

    public async setDisplayText(text: string, header: string) {
        const container = this.containerEl.children[1];
        container.empty();
        container.createEl("h2", { text: header });
        let spanEl = container.createSpan();
        /*let mpv = new MarkdownPreviewView(spanEl);
        mpv.set(text, false);*/
        await MarkdownRenderer.renderMarkdown(text, spanEl, "/", this.leaf.view);
    }

    async onOpen() {
        let view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!view)
            return;

        let editor = view.editor;
        if (!editor)
            return;

        let customerName = "";
        let initiativeName = "";
        const file = this.app.workspace.getActiveFile();
        let lineAtCaret = editor.getLine(editor.getCursor().line).trim();

        //Si estamos en un fichero de cliente, entonces la linea debería corresponderse con la regex de Customer Initiative
        //Con esa initiative nos vamos a buscar todos sus updates y recorremos ese fichero de la persona de cada Update
        if (file && file.path.contains(this.settings.customersBaseFolder)) {
            let initiativeRegex = new RegExp(this.settings.customerInitiativeRegex);
            customerName = file.basename;
            let initiativeLine = lineAtCaret.match(initiativeRegex);
            if (initiativeLine) {
                initiativeName = initiativeLine[1];
            }
        }

        //Si estamos en un fichero de persona, entonces la línea debería corresponderse con la regex de people update
        //De esa linea tenemos que extraer el Customer y la initiative para poder sacar todos sus updates y recorremos el fichero de la persona de cada udpate
        if (file && file.path.contains(this.settings.peopleBaseFolder)) {
            let updateRegex = new RegExp(this.settings.peopleUpdateRegex);
            let updateLine = lineAtCaret.match(updateRegex);
            if (updateLine) {
                let extraction = new RegExp('\\[{2}(.*)#(.*)\\]{2}'); //[[Customer#Initiative]]
                let extractionLine = updateLine[2].match(extraction);
                if (extractionLine) {
                    customerName = extractionLine[1];
                    initiativeName = extractionLine[2];
                }
            }
        }

        if (customerName === "" || initiativeName === "") {
            new Notice("Could not find Customer or Initiative at current line");
            console.error("ERR (InitiativeUpdatesView.ts): Could not find Customer or Initiative at file: {0} :: in line: {1}".format(file == null ? "No file detected" : file.path, lineAtCaret))
            return;
        }

        let initiative = this.customers.getCustomer(customerName)?.getInitiative(initiativeName);
        let updates: string = ""
        if (initiative) {
            initiative.updates.sort((a,b) => {return b.date.getTime() - a.date.getTime(); });
            for (let update of initiative.updates) {
                updates += "##### " + update.date.toDateString() + " " + update.person + "\n";
                updates += await getLinesOfHeader(this.app.vault, update.file, update.raw) + "\n";
            }
            let header = "{0}: {1}".format(initiative.customer, initiative.name);
            await this.setDisplayText(updates, header);
        }

    }

    async onClose() {
        // Nothing to clean up.
    }
}