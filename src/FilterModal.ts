import { App, Editor, Modal } from "obsidian";
import { Customers } from "./Customers";

export class FilterModal extends Modal {
	customers: Customers;
    editor?: Editor;

	constructor(app: App, editor: Editor | undefined, customers: Customers) {
		super(app);
		this.customers = customers;
        this.editor = editor;
	}

	onOpen() {
		const { contentEl } = this;
		
        contentEl.createEl('h2', {text: "Filter customer updates"});
        const filterEl = contentEl.createEl('div');
        filterEl.createEl('span', {text: "Filter: "});
        const filterInput = filterEl.createEl('input');
        filterInput.value = "";
        filterInput.style.cssText = 'float: right;';

        const submitBt = filterEl.createEl('button', {text: "Filter"});
        submitBt.style.cssText = 'float: right;';
        submitBt.addEventListener('click', () => {
            this.editor?.replaceSelection(this.customers.renderFilteredMD(filterInput.value));
            this.close();
        });
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}