import { CustomerUpdate } from "src/CustomerUpdate";

/** Defines a customer initiative the team is working on
 * Can have additional information using the following key::value
 * status::
 * partner::
 * speciality::
 */
export class CustomerInitiative {
    name: string;
    area: string;
    customer: string;
    updates: CustomerUpdate[];
    numUpdates: number;
    firstUpdate: Date;
    lastUpdate: Date;
    status: string;
    partner: string;
    speciality: string;
    raw: string;

    public constructor(name: string, area: string, customer: string) {
        this.name = name;
        this.area = area;
        this.customer = customer;
        this.updates = [];
        this.numUpdates = 0;
        this.firstUpdate = new Date("9999-12-31");
        this.lastUpdate = new Date("1900-01-01");
        this.status = "";
        this.partner = "";
        this.speciality = "";
        this.raw = "";
    }

    public addUpdateFromLine(updateLine: string) {

        let date = this.extractDate(updateLine);
        let person = this.extractPerson(updateLine);
        let update = new CustomerUpdate();

        if (date == null || person == "") {
            console.log("ERROR: Could not add update for the initiative. Date or person not detected. Line: " + updateLine);
            return;
        }

        update.area = this.area;
        update.customer = this.customer;
        update.initiative = this.name;
        update.date = date;
        update.person = person;
        update.raw = updateLine;

        this.addUpdate(update);
    }

    public addUpdate(update: CustomerUpdate) {
        this.numUpdates++;
        this.firstUpdate = (update.date < this.firstUpdate) ? update.date : this.firstUpdate;
        this.lastUpdate = (update.date > this.lastUpdate) ? update.date : this.lastUpdate;
        this.updates.push(update);
    }

    private extractDate(line: string): Date | null {
        let dateRegEx = new RegExp("(\\d{4}-\\d{2}-\\d{1,2})");
        let result = line.match(dateRegEx);
        if (result == null)
            return null;
        return new Date(result[0]);
    }

    private extractPerson(line: string): string {
        let personRegEx = new RegExp("(\\[{2}.*\\]{2})");
        let result = line.match(personRegEx);
        if (result == null)
            return "";
        return result[0];
    }

    public getInitiativeLink(text?: string): string {
        let clean = this.name;
        clean = clean.replace("##", "");
        clean = clean.replace("[[", "");
        clean = clean.replace("]]", "");
        if (text == null)
            return "[[{0}#{1}]]".format(this.customer, clean);

        else
            return "[[{0}#{1}\\|{2}]]".format(this.customer, clean, text);
    }

    public getAreaLink(text?: string): string {
        let clean = this.area;
        clean = clean.replace("#", "");
        clean = clean.replace("[[", "");
        clean = clean.replace("]]", "");
        if (text == null)
            return "[[{0}#{1}]]".format(this.customer, clean);

        else
            return "[[{0}#{1}\\|{2}]]".format(this.customer, clean, text);
    }

    public getCustomerLink(text?: string): string {
        let clean = this.customer;
        clean = clean.replace("#", "");
        clean = clean.replace("[[", "");
        clean = clean.replace("]]", "");
        if (text == null)
            return "[[{0}]]".format(clean);

        else
            return "[[{0}\\|{1}]]".format(clean, text);
    }
}
