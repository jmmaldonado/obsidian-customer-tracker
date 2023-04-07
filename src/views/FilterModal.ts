import { App, Editor, Modal, Setting } from "obsidian";
import { CustomerTracker } from "../CustomerTracker";
import { FilterSettings } from "../FilterSettings";

export class FilterModal extends Modal {
	tracker: CustomerTracker;
    editor?: Editor;
    filterSettings: FilterSettings;

	constructor(app: App, editor: Editor | undefined, tracker: CustomerTracker) {
		super(app);
		this.tracker = tracker;
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
            .setName("Sort by last update")
            .addToggle((toggle) => 
                toggle.setValue(this.filterSettings.sortByLastUpdate)
                .onChange((value) => {
                    this.filterSettings.sortByLastUpdate = value
                }));
    
        new Setting(contentEl)
            .addButton((btn) =>
            btn
                .setButtonText("Show summary table")
                .setCta()
                .onClick(() => {
                    this.close();
                    this.editor?.replaceSelection(this.tracker.renderMD(this.filterSettings));
                }));

        new Setting(contentEl)
        .addButton((btn) =>
            btn
                .setButtonText("Show all updates")
                .onClick(() => {
                    this.close();
                    this.editor?.replaceSelection(this.tracker.renderAllUpdatesMD(this.filterSettings));
                }));
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}