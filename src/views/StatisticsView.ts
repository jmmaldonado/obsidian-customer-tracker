import { App, ItemView, MarkdownRenderer, MarkdownView, Notice, Vault, WorkspaceLeaf } from "obsidian";

export const STATISTICS_VIEW_TYPE = "statistics-view";

export class StatisticsView extends ItemView {

    viewMDContent: string;

    constructor(leaf: WorkspaceLeaf, app: App, viewMDContent: string) {
        super(leaf);
        this.app = app;
        this.viewMDContent = viewMDContent;
    }

    getViewType() {
        return STATISTICS_VIEW_TYPE;
    }

    getDisplayText() {
        return "Customer Tracking statistics";
    }

    public async setDisplayText(text: string, header: string) {
        const container = this.containerEl.children[1];
        container.empty();
        container.createEl("h2", { text: header });
        let spanEl = container.createSpan();
        await MarkdownRenderer.renderMarkdown(text, spanEl, "/", this.leaf.view);
    }

    async onOpen() {
        
        await this.setDisplayText(this.viewMDContent, "Customer Tracking Statistics");

    }

    async onClose() {
        // Nothing to clean up.
    }
}