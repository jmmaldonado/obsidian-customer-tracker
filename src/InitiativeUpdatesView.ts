import { ItemView, WorkspaceLeaf } from "obsidian";

export const INITIATIVEUPDATES_VIEW_TYPE = "initiative-updates-view";

export class InitiativeUpdatesView extends ItemView {
  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
  }

  getViewType() {
    return INITIATIVEUPDATES_VIEW_TYPE;
  }

  getDisplayText() {
    return "Initiative updates view";
  }

  async onOpen() {
    const container = this.containerEl.children[1];
    container.empty();
    container.createEl("h4", { text: "Initiative updates view" });
  }

  async onClose() {
    // Nothing to clean up.
  }
}