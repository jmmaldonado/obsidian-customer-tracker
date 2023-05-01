import { TFile } from "obsidian";

export class UpdatedHeader {
    date: Date;
    text: string;
    raw: string;
    file: TFile;

    public getLink(text?: string): string {
        let clean = this.raw;
        clean = clean.replace("##### ","");
        clean = clean.replace("#### ","");
        clean = clean.replace("### ","");
        clean = clean.replace("## ","");
        clean = clean.replace("# "," ");
        clean = clean.replace("#","");
        clean = clean.replace("[[", "");
        clean = clean.replace("]]", "");
        if (text == null)
            return "[[{0}#{1}]]".format(this.file.basename, clean);
        else
            return "[[{0}#{1}\\|{2}]]".format(this.file.basename, clean, text);
    }
}