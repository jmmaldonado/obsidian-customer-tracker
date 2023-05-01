import { App, FileView, ItemView, MarkdownRenderer, MarkdownView, Notice, Vault, WorkspaceLeaf } from "obsidian";
import { UpdatedHeader } from "src/UpdatedHeader";
import { CustomerTracker } from "../CustomerTracker";
import { CustomerTrackerSettings } from "../Settings";
import { getLinesOfHeader } from "../Utils";

export const RECENTUPDATES_VIEW_TYPE = "recent-updates-view";

export class RecentUpdatesView extends ItemView {

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
        return RECENTUPDATES_VIEW_TYPE;
    }

    getDisplayText() {
        return "Recent updates view";
    }

    public async setDisplayText(text: string, header: string) {
        const container = this.containerEl.children[1];
        container.empty();
        container.createEl("h2", { text: header });
        let spanEl = container.createDiv();
        await MarkdownRenderer.renderMarkdown(text, spanEl, "/", this.leaf.view);
    }

    async onOpen() {
		const { vault } = this.app;
		let dateRegex = new RegExp('.*(\\d{4}-\\d{2}-\\d{2})\\s(.*)'); //Captures ...yyyy-MM-dd...);
        let updateRegex = new RegExp(this.settings.peopleUpdateRegex);
		const files = this.app.vault.getMarkdownFiles()
        let updatedHeaders: UpdatedHeader[] = [];
		for (const file of files) {
            let fileContent = await vault.cachedRead(file);
            let lines = fileContent.split("\n").filter(line => line.startsWith("#"));
			for (const line of lines) {
                //If the line has a date we consider it, but it cannot be a people update for an initiative, as we may be getting irrelevant hits
                //We just want to get the high level headers updated, not every header that has a date in it
                let updateLine = line.match(updateRegex);
				if (updateLine) 
                    continue;

                let dateLine = line.match(dateRegex);
                if (dateLine) {
                    let header = new UpdatedHeader();
					header.date = new Date(dateLine[1]);
                    header.text = dateLine[2];
                    header.raw = line;
                    header.file = file;
                    if (!updatedHeaders.contains(header))
                        updatedHeaders.push(header);
                }
            }
        }

        updatedHeaders.sort((a,b) => {return b.date.getTime() - a.date.getTime(); });

        let headersText: string = "[[Telefonica]] \n";
        for (let header of updatedHeaders) {
            //headersText += "" + header.date.toDateString() + " " + header.text + "\n";
            let linkText = "{0} {1} ({2})".format(
                header.date.toISOString().split("T")[0],
                header.text,
                header.file.basename)
            headersText += header.getLink(linkText) + " \n";
        }
        let header = "Recently updated headers";
        await this.setDisplayText(headersText, header);

     }

    async onClose() { }
}