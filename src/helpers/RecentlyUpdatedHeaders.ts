import CustomerTracking from "src/main";
import { UpdatedHeader } from "src/UpdatedHeader";
import { normalizeText } from "src/Utils";

export async function getRecentlyUpdatedHeadersMD(customerTracking: CustomerTracking): Promise<string> {
    const { vault } = customerTracking.app;
    let dateRegex = new RegExp('.*(\\d{4}-\\d{2}-\\d{2}).*'); //Captures ...yyyy-MM-dd...);
    let dateAndTextRegex = new RegExp('.*(\\d{4}-\\d{2}-\\d{2})\\s(.*)'); //Captures ...yyyy-MM-dd TEXT...);
    let updateRegex = new RegExp(customerTracking.settings.peopleUpdateRegex);
    const files = vault.getMarkdownFiles()
    let updatedHeaders: UpdatedHeader[] = [];

    //We consider every line starting with # of every file in the vault that contains a date
    for (const file of files) {
        let fileContent = await vault.cachedRead(file);
        let lines = fileContent.split("\n").filter(line => line.startsWith("#"));
        for (const line of lines) {
            //If the line has a date we consider it, but it cannot be a people update for an initiative, as we may be getting irrelevant hits
            //We just want to get the high level headers updated, not every header that has a date in it
            let updateLine = line.match(updateRegex);
            if (updateLine) 
                continue;

            let dateLine = line.match(dateRegex);
            let dateTextLine = line.match(dateAndTextRegex);

            if (dateTextLine) {
                let header = new UpdatedHeader();
                header.date = new Date(dateTextLine[1]);
                header.text = dateTextLine[2];
                header.raw = line;
                header.file = file;
                if (!updatedHeaders.contains(header))
                    updatedHeaders.push(header);
            } else if (dateLine) {
                let header = new UpdatedHeader();
                header.date = new Date(dateLine[1]);
                header.text = file.basename;
                header.raw = line;
                header.file = file;
                if (!updatedHeaders.contains(header))
                    updatedHeaders.push(header);
            }
        }
    }

    updatedHeaders.sort((a,b) => {return b.date.getTime() - a.date.getTime(); });

    let headersText: string = "";
    for (let header of updatedHeaders) {
        let linkText = "{0} {1} ({2})".format(
            header.date.toISOString().split("T")[0],
            header.text,
            header.file.basename)
        headersText += header.getLink(linkText) + " \n";
    }
    return headersText;
}