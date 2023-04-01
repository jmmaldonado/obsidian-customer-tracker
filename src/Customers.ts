import { CustomerInitiatives, CustomerInitiative } from "src/CustomerInitiatives"
import { CustomerUpdate } from "./CustomerUpdates";
import { FilterSettings } from "./FilterSettings";

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

    public getAllOpenInitiatives(): CustomerInitiative[] {
        let result: CustomerInitiative[] = [];
        for (let [, customer] of this.customers) 
            for (let [, area] of customer.areas) 
                for (let [, initiative] of area.initiatives) 
                result.push(initiative);
        return result;
    }

    public addUpdate(update: CustomerUpdate) {
        let customer = this.getCustomer(update.customer);
        if (customer) {
            let initiatives = customer.getInitiativesFromArea(update.area);
            if (initiatives) {
                let initiative = initiatives.getInitiative(update.initiative);
                if (initiative) {
                    initiative.addUpdate(update);
                } else {
                    console.log("ERR: Initiative ({0}) not found in customers object".format(update.initiative));
                    console.dir(initiatives);
                    console.dir(customer);
                    console.dir(this.customers);
                }

            } else {
                console.log("ERR: Initiatives for area ({0}) not found in customers object". format(update.area));
                console.dir(customer);
                console.dir(this.customers);
            }

        } else {
            console.log("ERR: Customer ({0}) not found in customers object".format(update.customer));
            console.dir(this.customers);
        }
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


    public renderMD(filterSettings?: FilterSettings): string {
        if (this.customers.size == 0)
            return "No customer updates";
        
        let md = "";
        md += "| Customer | Initiative | Status | Updates | Days Ago | First seen | People |\n"
        md += "|----------|------------|--------|---------|----------|------------|--------|\n"

        //Para poder ordenar por last updated, tenemos primero que generar una nueva lista con todas las iniciativas
        //Y ordenarlas segun el parametro que consideremos en el los filterSettings, luego iterar sobre la nueva lista
        //Mirando si el filtro aplica para mostrarla o no

        let allInitiatives: CustomerInitiative[] = [];
        for (let customer of this.customers.values()) {
            for (let area of customer.areas.values()) {
                for (let initiative of area.initiatives.values()) {
                    allInitiatives.push(initiative);
                }
            }
        }

        if (filterSettings && filterSettings.sortByLastUpdate) {
            allInitiatives.sort((a,b) => {return b.lastUpdate.getTime() - a.lastUpdate.getTime(); });
        }

        for (let initiative of allInitiatives) {
            let people: string[] = [];
            let peopleString: string = "";

            let peopleLastUpdate: Map<string, CustomerUpdate> = new Map<string, CustomerUpdate>();
            for (let update of initiative.updates) {
                let personUpdate = peopleLastUpdate.get(update.person);
                if (personUpdate) {
                    if (update.date > personUpdate.date) {
                        peopleLastUpdate.set(update.person, update);
                    }
                } else {
                    peopleLastUpdate.set(update.person, update);
                }

                //We generate this array to filter easily on people later on
                if(!people.includes(update.person))
                    people.push(update.person);
                    peopleString += " " + update.person;
            }

            let stringLiterals = "";
            stringLiterals += "{0} ".format(initiative.customer);
            stringLiterals += "{0} ".format(initiative.area);
            stringLiterals += "{0} ".format(initiative.name);
            stringLiterals += "{0} ".format(peopleString);

            if (!filterSettings || this.checkFilter(filterSettings, stringLiterals, initiative)) {

                md += "| {0} |".format(initiative.getCustomerLink(initiative.customer));
                md += "  {0} |".format(initiative.getInitiativeLink(initiative.name));
                md += "  {0} |".format(initiative.status);
                md += "  {0} |".format(initiative.numUpdates.toString());
                md += "  {0} |".format(Math.ceil((new Date().getTime() - initiative.lastUpdate.getTime()) / (1000 * 3600 * 24)).toString());
                md += "  {0} |".format(initiative.firstUpdate.toDateString());

                for (let [person, update] of peopleLastUpdate) {
                    md += " " + update.getLinkToUpdateAndPerson("Last update") + "</br> "
                }

                md += " |\n"
            }
        }


        return md;

    }

    public renderAllUpdatesMD(filterSettings?: FilterSettings): string {
        if (this.customers.size == 0)
            return "No customer updates";
        
        let md = "";

        for (let [, customer] of this.customers) {
            let shownUpdates = false;
            for (let [, area] of customer.areas) {
                for (let initiative of area.initiatives.values()) {

                    let stringLiterals = "";
                    stringLiterals += "{0} ".format(initiative.customer);
                    stringLiterals += "{0} ".format(initiative.area);
                    stringLiterals += "{0} ".format(initiative.name);

                    if (!filterSettings || this.checkFilter(filterSettings, stringLiterals, initiative)) {
                        //Sort updates in reverse chronological order
                        initiative.updates.sort((a,b) => {return b.date.getTime() - a.date.getTime(); });
                        for (let update of initiative.updates) {
                            md += " \n !" + update.getLink();
                        }
                        shownUpdates = true;
                    }
                    if (shownUpdates) md += "\n---";
                }
                if (shownUpdates) md += "\n---";
            }
            if (shownUpdates) md += "\n---";
        }

        return md;
    }

    public renderInitiativesToFolloup(person: string) : string {
        if (this.customers.size == 0)
            return "No customer updates";

        let md = "";

        for (let [, customer] of this.customers) {
            for (let [, area] of customer.areas) {
                for (let [, initiative] of area.initiatives) {
                    let people: string[] = [];
                    let peopleString: string = "";

                    let peopleLastUpdate: Map<string, CustomerUpdate> = new Map<string, CustomerUpdate>();
                    for (let update of initiative.updates) {
                        //We generate this array to filter easily on people later on
                        if(!people.includes(update.person))
                            people.push(update.person);
                            peopleString += " " + update.person;
                    }

                    let stringLiterals = "";
                    stringLiterals += "{0} ".format(initiative.customer);
                    stringLiterals += "{0} ".format(initiative.area);
                    stringLiterals += "{0} ".format(initiative.name);
                    stringLiterals += "{0} ".format(peopleString);

                    let filterSettings = new FilterSettings();
                    filterSettings.filter = person;
                    filterSettings.onlyOpen = true;

                    if (!filterSettings || this.checkFilter(filterSettings, stringLiterals, initiative)) {
                        md += "##### {0} {1} \n\n".format(new Date().toISOString().split("T")[0], initiative.getInitiativeLink());
                    }
                }
            }
        }

        return md;
    }


    private checkFilter(filterSettings: FilterSettings, literals: string, initiative: CustomerInitiative): boolean {
        let result = true;
        
        //Check if we need to filter based on the text entry for any literal related field
        if (literals.contains(filterSettings.filter) || filterSettings.filter === "") 
            result = result && true;
        else 
            result = result && false;

        //Check if we need to filter based on the age of the latest update for the initiative
        let lastUpdateDaysAgo = Math.ceil((new Date().getTime() - initiative.lastUpdate.getTime()) / (1000 * 3600 * 24));
        result = result && (lastUpdateDaysAgo >= filterSettings.olderThan);

        //Check if we need to filter only open initiatives
        if (filterSettings.onlyOpen) 
            result = result && initiative.status === "";

        return result;
    }
}

export class Customer {
    name: string;
    path: string;
    areas: Map<string, CustomerInitiatives>;

    public constructor(name: string, path: string) {
        this.name = name;
        this.path = path;
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
