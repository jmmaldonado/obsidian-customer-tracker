import { TFile } from "obsidian";

export class CustomerUpdate {
    customer: string;
    area: string;
    initiative: string;
    date: Date;
    person: string;
    raw: string;
    file: TFile;
    
    public getLinkToUpdateAndPerson(text?: string): string {
        if (this.person === "myself") {
            let clean = this.raw;
            clean = clean.replace("#####","");
            clean = clean.replace("#"," ");
            clean = clean.replace("[[", "");
            clean = clean.replace("]]", "");
            if (text == null)
                return "[[{0}#{1}]] by {2}".format(this.file.basename, clean, this.person);
            else
                return "[[{0}#{1}\\|{2}]] by {3}".format(this.file.basename, clean, text, this.person);
        } else {
            let clean = this.raw;
            clean = clean.replace("#####","");
            clean = clean.replace("#"," ");
            clean = clean.replace("[[", "");
            clean = clean.replace("]]", "");
            if (text == null)
                return "[[{0}#{1}]] by {2}".format(this.person, clean, this.person);
            else
                return "[[{0}#{1}\\|{2}]] by [[{3}]]".format(this.person, clean, text, this.person);
        }
    }

    public getLink(text?: string): string {
        let clean = this.raw;
        clean = clean.replace("#####","");
        clean = clean.replace("#"," ");
        clean = clean.replace("[[", "");
        clean = clean.replace("]]", "");
        if (text == null)
            return "[[{0}#{1}]]".format(this.person, clean);
        else
            return "[[{0}#{1}\\|{2}]]".format(this.person, clean, text);
    }

}
