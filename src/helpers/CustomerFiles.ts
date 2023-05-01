import { Customer } from "src/Customer";
import { CustomerInitiative } from "src/CustomerInitiative";
import CustomerTracking from "src/main";

export async function generateCustomerInitiatives(customerTracking: CustomerTracking) : Promise<void> {
    const { vault } = customerTracking.app;
    let initiativeRegex = new RegExp(customerTracking.settings.customerInitiativeRegex);
    const files = vault.getMarkdownFiles()
    for (const file of files) {
        if (!file.basename.startsWith("+") && file.path.contains(customerTracking.settings.customersBaseFolder)) {
            let customer: Customer = new Customer(file.basename, file.path);
            customer.addArea("");
            let fileContent = await vault.cachedRead(file);
            let lines = fileContent.split("\n"); //.filter(line => line.includes("#"))
            for (let i = 0; i < lines.length; i++) {
                let line = lines[i];
                let initiativeLine = line.match(initiativeRegex);
                if (initiativeLine) {
                    let initiative: CustomerInitiative = new CustomerInitiative(initiativeLine[1], "", customer.name);
                    initiative.raw = initiativeLine[0];
                    
                    //Capture all the content for the initiative in an array to further process for metadata
                    //Could be improved to move the parent loop to the next found initiative line ... future refactor
                    let foundNextInitiative = false;
                    let secondaryIndex = i + 1;
                    let initiativeContent: string[] = [];
                    while(!foundNextInitiative && secondaryIndex < lines.length) {
                        let line2 = lines[secondaryIndex];
                        //If the line is not an initiative, we add it to the content array
                        let initiativeLine2 = line2.match(initiativeRegex);
                        if (!initiativeLine2)
                            initiativeContent.push(line2)
                        else
                            foundNextInitiative = true;
                        secondaryIndex++;
                    }

                    //Get additional information for the initiative
                    initiative.status = extractAdditionalData("status", initiativeContent);
                    initiative.partner = extractAdditionalData("partner", initiativeContent);
                    initiative.speciality = extractAdditionalData("speciality", initiativeContent);

                    customer.addInitiativeToArea("", initiative);
                }

            }
            customerTracking.tracker.addCustomer(customer);
        }
    }
}

function extractAdditionalData(key: string, initiativeContent: string[]): string {
    let index = 0;
    while (index < initiativeContent.length) {
        let line = initiativeContent[index];
        if (line.contains("::")) {
            let splittedLine = line.split("::");
            if (splittedLine[0] === key)
                return splittedLine[1];
        }
        index++;
    }
    return "";
}