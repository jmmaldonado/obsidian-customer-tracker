import { it } from "node:test";
import { App, Editor, FuzzyMatch, FuzzySuggestModal } from "obsidian";
import { CustomerInitiative } from "./CustomerInitiatives";
import { Customers } from "./Customers";

export class SelectInitiativeModal extends FuzzySuggestModal<CustomerInitiative> {
    private editor: Editor;
    private customers: Customers;
    
    public constructor(app: App, customers: Customers, editor: Editor) {
        super(app);
        this.customers = customers;
        this.editor = editor;
    }

    getItems(): CustomerInitiative[] {
        return this.customers.getAllOpenInitiatives();
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