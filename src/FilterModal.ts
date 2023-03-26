import { App, Editor, Modal, Setting } from "obsidian";
import { Customers } from "./Customers";
import { FilterSettings } from "./FilterSettings";

export class FilterModal extends Modal {
	customers: Customers;
    editor?: Editor;
    filterSettings: FilterSettings;

	constructor(app: App, editor: Editor | undefined, customers: Customers) {
		super(app);
		this.customers = customers;
        this.editor = editor;
        this.filterSettings = new FilterSettings();
	}

	onOpen() {
		const { contentEl } = this;

        contentEl.createEl("h1", { text: "Display customer updates" });

        new Setting(contentEl)
            .setName("Filter on")
            .addText((text) =>
            text.onChange((value) => {
                this.filterSettings.filter = value
            }));

        new Setting(contentEl)
            .setName("Only open initiatives")
            .addToggle((toggle) => 
                toggle.setValue(this.filterSettings.onlyOpen)
                .onChange((value) => {
                    this.filterSettings.onlyOpen = value
                }));

        new Setting(contentEl)
            .setName("With updates older than")
            .addText((text) =>
                text.setValue(this.filterSettings.olderThan.toString())
                .onChange((value) => {
                    this.filterSettings.olderThan = Number(value)
                }));
    
        new Setting(contentEl)
            .addButton((btn) =>
            btn
                .setButtonText("Show summary table")
                .setCta()
                .onClick(() => {
                    this.close();
                    this.editor?.replaceSelection(this.customers.renderMD(this.filterSettings));
                }));

        new Setting(contentEl)
        .addButton((btn) =>
            btn
                .setButtonText("Show all updates")
                .onClick(() => {
                    this.close();
                    this.editor?.replaceSelection(this.customers.renderAllUpdatesMD(this.filterSettings));
                }));
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}