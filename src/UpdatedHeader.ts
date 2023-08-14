import { TFile } from "obsidian";
import { normalizeText } from "./Utils";

export class UpdatedHeader {
    date: Date;
    text: string;
    raw: string;
    file: TFile;

    public getLink(text?: string): string {
        if (text == null)
            return "[[{0}#{1}]]".format(this.file.basename, normalizeText(this.raw));
        else
            return "[[{0}#{1}\\|{2}]]".format(this.file.basename, normalizeText(this.raw), normalizeText(text));
    }
}