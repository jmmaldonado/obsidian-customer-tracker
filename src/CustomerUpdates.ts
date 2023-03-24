export class CustomerUpdate {
    customer: string;
    area: string;
    initiative: string;
    date: Date | null;
    person: string;
    raw: string;
    
    public getLink(text?: string): string {
        let clean = this.raw;
        clean = clean.replace("####","");
        clean = clean.replace("[[", "");
        clean = clean.replace("]]", "");
        if (text == null)
            return "[[{0}#{1}]]".format(this.customer, clean);
        else
            return "[[{0}#{1}\\|{2}]]".format(this.customer, clean, text);
    }

}
