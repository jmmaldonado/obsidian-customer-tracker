import { CustomerInitiatives, CustomerInitiative } from "src/CustomerInitiatives"

export class Customers {
    customers: Map<string, Customer>;

    public constructor() {
        this.customers = new Map<string, Customer>();
    }

    public contains(customer: string): boolean {
        return this.customers.has(customer);
    }

    public getCustomer(customer: string): Customer | undefined {
        return this.customers.get(customer);
    }

    public addCustomer(customer: Customer) {
        this.customers.set(customer.name, customer);
    }

    public renderHTML(): string {
        if (this.customers.size == 0)
            return "No customer updates";

        let html = ""
        html += "<table>"
        html += "  <tr>"
        html += "    <td>Customer</td>"
        html += "    <td>Area</td>"
        html += "    <td>Initiative</td>"
        html += "    <td>Updates</td>"
        html += "    <td>Days ago</td>"
        html += "    <td>First seen</td>"
        html += "    <td>People</td>"
        html += "  </tr>"

        for (let [, customer] of this.customers) {
            for (let [, area] of customer.areas) {
                for (let [, initiative] of area.initiatives) {
                    let people: string[] = [];
                    for (let update of initiative.updates) {
                        if(!people.includes(update.person))
                            people.push(update.person);
                    }
                    html += "  <tr>"
                    html += "    <td>" + initiative.customer + "</td>"
                    html += "    <td>" + initiative.area + "</td>"
                    html += "    <td>" + initiative.name + "</td>"
                    html += "    <td>" + initiative.numUpdates + "</td>"
                    html += "    <td>" + Math.ceil((new Date().getTime() - initiative.lastUpdate.getTime()) / (1000 * 3600 * 24)) + "</td>"
                    html += "    <td>" + initiative.firstUpdate + "</td>"
                    html += "    <td>"
                        for (let person of people) {
                            html += person + "</br>"
                        }
                    html += "    </td>"

                    html += "  </tr>"
                }
            }
        }

        html += "</table>"
        return html;
    }

    public renderMD(): string {
        if (this.customers.size == 0)
            return "No customer updates";

        let md = "";
        md += "| Customer | Area | Initiative | Updates | Days Ago | First seen | People |\n"
        md += "|----------|------|------------|---------|----------|------------|--------|\n"
        for (let [, customer] of this.customers) {
            for (let [, area] of customer.areas) {
                for (let [, initiative] of area.initiatives) {
                    let people: string[] = [];
                    for (let update of initiative.updates) {
                        if(!people.includes(update.person))
                            people.push(update.person);
                    }
                    md += "| {0} |".format(initiative.customer);
                    md += "  {0} |".format(initiative.area);
                    md += "  {0} |".format(initiative.name);
                    md += "  {0} |".format(initiative.numUpdates.toString());
                    md += "  {0} |".format(Math.ceil((new Date().getTime() - initiative.lastUpdate.getTime()) / (1000 * 3600 * 24)).toString());
                    md += "  {0} |".format(initiative.firstUpdate.toDateString());

                    for (let person of people) {
                            md += " " + person + "</br> "
                        }
                    md += " |\n"
                }
            }
        }
        return md;
    }
}

export class Customer {
    name: string;
    file: string;
    areas: Map<string, CustomerInitiatives>;

    public constructor(name: string, file: string) {
        this.name = name;
        this.file = file;
        this.areas = new Map();
    }

    public containsArea(areaName: string): boolean {
        return this.areas.has(areaName);
    }

    public addArea(areaName: string) {
        if (!this.containsArea(areaName))  {
            let initiatives = new CustomerInitiatives(areaName, this.name);
            this.areas.set(areaName, initiatives);
        }
    }

    public getInitiativesFromArea(area: string): CustomerInitiatives | undefined | null {
        if (!this.containsArea(area)) 
            return null;
        return this.areas.get(area);
    }

    public addInitiativeToArea(area: string, initiative: CustomerInitiative | undefined) {
        if (initiative === undefined)
            return;

        let areaInitiatives = this.getInitiativesFromArea(area);
        if (areaInitiatives == null)
            areaInitiatives = new CustomerInitiatives(area, this.name);
        areaInitiatives.setInitiative(initiative.name, initiative);    
        this.areas.set(area, areaInitiatives);
    }
}
