import { CustomerInitiative } from "src/CustomerInitiative";
import { Customer } from "./Customer";
import { CustomerInitiatives } from "./CustomerInitiatives";
import { CustomerUpdate } from "./CustomerUpdate";
import { FilterSettings } from "./FilterSettings";
import { PeopleUpdates } from "./PeopleUpdates";

export class CustomerTracker {
    customers: Map<string, Customer>;
    peopleUpdates: PeopleUpdates;

    public constructor() {
        this.customers = new Map<string, Customer>();
        this.peopleUpdates = new PeopleUpdates();
    }

    public containsCustomer(customer: string): boolean {
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
                    this.peopleUpdates.addUpdate(update, initiative.status);
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

    public generateStatisticsMD(): string {
		let md = "";
        md += "| Person | Customer | Initiatives | WIP | Won | Lost | Other |\n"
        md += "|--------|----------|-------------|-----|-----|------|-------|\n"

		for (const [person, initiatives] of this.peopleUpdates.updates) {
			let initiativesByStatus = this.peopleUpdates.numberOfInitiativesByStatus(person);	
			md += "| {0} |".format(person);
			md += "  {0} |".format(this.peopleUpdates.numberOfCustomers(person).toString());
			md += "  {0} |".format(this.peopleUpdates.numberOfInitatives(person).toString());
			md += "  {0} |".format(initiativesByStatus[0].toString());
			md += "  {0} |".format(initiativesByStatus[1].toString());
			md += "  {0} |".format(initiativesByStatus[2].toString());
			md += "  {0} |".format(initiativesByStatus[3].toString());
			md += "\n";
		}

		return md;
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

                //FIX #35 Sort peopleLastUpdate by date descending
                let peopleLastUpdateSorted: CustomerUpdate[] = [];
                for (let update of peopleLastUpdate.values())
                    peopleLastUpdateSorted.push(update);
                peopleLastUpdateSorted.sort((a,b) => { return b.date.getTime() - a.date.getTime(); });

                for (let update of peopleLastUpdateSorted) {
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


