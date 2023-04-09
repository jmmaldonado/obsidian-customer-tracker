import { App, ItemView, MarkdownRenderer, MarkdownView, Notice, Vault, WorkspaceLeaf } from "obsidian";
import { CustomerTracker } from "../CustomerTracker";
import { CustomerTrackerSettings } from "../Settings";
import { getLinesOfHeader } from "../Utils";

export const INITIATIVEUPDATES_VIEW_TYPE = "initiative-updates-view";

export class InitiativeUpdatesView extends ItemView {

    app: App;
    tracker: CustomerTracker;
    settings: CustomerTrackerSettings;

    constructor(leaf: WorkspaceLeaf, app: App, tracker: CustomerTracker, settings: CustomerTrackerSettings) {
        super(leaf);
        this.app = app;
        this.tracker = tracker;
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

        if (lineAtCaret.length == 0)
            return;

        //If the current file is under the CustomerBase folder, the line should match Customer Initiative Regex defined in settings
        //Since we have the customer name (file.basename) we can just gather the initiative and move on to finding all the updates
        if (file) {

            if (file.path.contains(this.settings.customersBaseFolder)) {
                let initiativeRegex = new RegExp(this.settings.customerInitiativeRegex);
                customerName = file.basename;
                let initiativeLine = lineAtCaret.match(initiativeRegex);
                if (initiativeLine) {
                    initiativeName = initiativeLine[1];
                }
            } else {
                //If we are not in a customer file, we just try to match with a Customer#Initiative backlink regex
                let extraction = new RegExp('.*\\[{2}(.*)#(.*)\\]{2}.*'); //...[[Customer#Initiative]]...
                let extractionLine = lineAtCaret.match(extraction);
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

        let initiative = this.tracker.getCustomer(customerName)?.getInitiative(initiativeName);
        let updates: string = ""
        if (initiative) {
            initiative.updates.sort((a,b) => {return b.date.getTime() - a.date.getTime(); });
            for (let update of initiative.updates) {
                updates += "##### " + update.date.toDateString() + " " + update.person + "\n";
                updates += await getLinesOfHeader(this.app.vault, update.file, update.raw) + "\n";
            }
            let header = "{0}: {1}".format(initiative.customer, initiative.name);
            await this.setDisplayText(updates, header);
        } else {
            new Notice("Could not find Initiative at current line");
            console.error("ERR (InitiativeUpdatesView.ts): Could not find Customer or Initiative at file: {0} :: in line: {1}".format(file == null ? "No file detected" : file.path, lineAtCaret))
        }

    }

    async onClose() {
        // Nothing to clean up.
    }
}