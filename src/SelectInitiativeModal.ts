import { it } from "node:test";
import { App, Editor, FuzzyMatch, FuzzySuggestModal } from "obsidian";
import { CustomerInitiative } from "./CustomerInitiative";
import { CustomerTracker } from "./CustomerTracker";

export class SelectInitiativeModal extends FuzzySuggestModal<CustomerInitiative> {
    private editor: Editor;
    private tracker: CustomerTracker;
    
    public constructor(app: App, tracker: CustomerTracker, editor: Editor) {
        super(app);
        this.tracker = tracker;
        this.editor = editor;
    }

    getItems(): CustomerInitiative[] {
        return this.tracker.getAllOpenInitiatives();
    }

    getItemText(initiative: CustomerInitiative): string {
        let result = "";
        result += initiative.customer + " ";
        result += initiative.name + " ";
        result += initiative.area + " ";
        result += initiative.status;
        return result;
    }

    onChooseItem(item: CustomerInitiative, evt: MouseEvent | KeyboardEvent): void {
        let md = "##### {0} {1} \n".format(new Date().toISOString().split("T")[0], item.getInitiativeLink());
        this.editor.replaceSelection(md);
    }

    renderSuggestion(item: FuzzyMatch<CustomerInitiative>, el: HTMLElement) {
        const  initiative = item.item;
        let topLine = "";
        topLine = "{0} - {1}".format(initiative.customer, initiative.name)

        let bottomLine = "";
        if (initiative.status === "")
            bottomLine = initiative.customer;
        else
            bottomLine = "{0} ({1})".format(initiative.customer, initiative.status);

        el.createEl("div", { text: topLine });
        el.createEl("small", { text: bottomLine });
    }
}