// This creates a CSV for later consumption in dashboarding tools like Looker Studio

import { CustomerInitiative } from "src/CustomerInitiative";
import { CustomerUpdate } from "src/CustomerUpdate";
import CustomerTracking from "src/main";

export function generateDashboardNoteCSVContent(customerTracking: CustomerTracking): string {

    if (customerTracking.tracker.customers.size == 0)
        return "No customer updates";
    
    let md = "";
    md += "Customer,Initiative,Status,Partner,Speciality,NumUpdates,DaysAgo,FirstUpdate\n"

    let allInitiatives: CustomerInitiative[] = [];
    for (let customer of customerTracking.tracker.customers.values()) {
        for (let area of customer.areas.values()) {
            for (let initiative of area.initiatives.values()) {
                allInitiatives.push(initiative);
            }
        }
    }

    allInitiatives.sort((a,b) => {return b.lastUpdate.getTime() - a.lastUpdate.getTime(); });

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

        md += "\"{0}\",".format(initiative.customer);
        md += "\"{0}\",".format(initiative.name);
        md += "\"{0}\",".format(initiative.status);
        md += "\"{0}\",".format(initiative.partner);
        md += "\"{0}\",".format(initiative.speciality);
        md += "\"{0}\",".format(initiative.numUpdates.toString());
        md += "\"{0}\",".format(Math.ceil((new Date().getTime() - initiative.lastUpdate.getTime()) / (1000 * 3600 * 24)).toString());
        md += "\"{0}\"".format(initiative.firstUpdate.toDateString());
        md += "\n";
 
    }

    return md;
}

