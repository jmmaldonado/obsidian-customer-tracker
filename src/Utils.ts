import { normalizePath, TFile, TFolder, Vault } from "obsidian";

// Returns the number of # at the beginning of the line
function headerDepth(line: string): number {
    let result = 0;
    if (isHeader(line))
        return line.split(" ")[0].length
    return result;
}

//Checks if the line is a header line (starts with # and has a space)
function isHeader(line: string): boolean {
    return line.startsWith("#") && line.contains(" ");
}

export async function getLinesOfHeader(vault: Vault, file: TFile | null, header:string): Promise<string> {
    let result: string = "";
    if (!file)
        return "";

    if (isHeader(header)) {
        let depth = headerDepth(header);
        let fileContent = await vault.cachedRead(file);
        let lines = fileContent.split("\n");

        let found = false;
        let idx = 0;
        //First loop to find the header we are looking for
        while (!found && idx < lines.length) {
            found = lines[idx] == header;
            idx++;
        }

        if (found) {
            let finished = false;
            //We start looking for the next same level or higher header just below our found header
            while (!finished && idx < lines.length) {
                let line = lines[idx];
                if (isHeader(line) && headerDepth(line) <= depth) {
                    finished = true;
                } else {
                    result += line + "\n";
                    idx++;
                }
            }
        } else {
            console.error("ERR: Could not find header: {0} in file: {1}".format(header, file.path));
        }
    }

    return result;
}

export function normalizeFilename(fileName: string): string {
    const illegalSymbols = [':', '#', '/', '\\', '|', '?', '*', '<', '>', '"'];
    let finished = false;
    while (!finished) {
        if (illegalSymbols.some((el) => fileName.contains(el))) {
            illegalSymbols.forEach((ilSymbol) => {
                fileName = fileName.replace(ilSymbol, '');
            });
        } else {
            finished = true;
        }
    }
    return fileName;
}

export function normalizeText(text: string): string {
    const illegalSymbols = ['[',']','|', '#'];
    let finished = false;
    while (!finished) {
        if (illegalSymbols.some((el) => text.contains(el))) {
            illegalSymbols.forEach((ilSymbol) => {
                text = text.replace(ilSymbol, '');
            });
        } else {
            finished = true;
        }
    }
    return text;
    
}

export async function checkAndCreateFolder(vault: Vault, folderpath: string) {
    folderpath = normalizePath(folderpath);
    const folder = vault.getAbstractFileByPath(folderpath);
    if (folder && folder instanceof TFolder) {
        return;
    }
    await vault.createFolder(folderpath);
}


export async function writeFile(path: string, fileName: string, content: string, replaceExistingContent: boolean): Promise<TFile | null> {
    let filePath;
    fileName = normalizeFilename(fileName);
    await checkAndCreateFolder(this.app.vault, path);

    filePath = path ? normalizePath(`${path}/${fileName}`) : normalizePath(`/${fileName}`);

    //If the file exists, we delete it if replaceExistingContent is true or return false 
    if (await this.app.vault.adapter.exists(filePath)) {
        let file = this.app.vault.getAbstractFileByPath(filePath);
        if (file && replaceExistingContent) {
            //File exist and we need to replace existing content
            await this.app.vault.delete(file);
        } else
            return null;
    } 
    
    //At this point the filePath should not exist (because it didnt exist in the first place or because we deleted it)
    //So we create a new file with the required content.
    const newFile: TFile = await this.app.vault.create(filePath, content);
    return newFile;
}

export const timeAgo = (date: string | number | Date) => {
    const time = Math.floor(
        (new Date().valueOf() - new Date(date).valueOf()) / 1000
    );
    const { interval, unit } = calculateTimeDifference(time);
    const suffix = interval === 1 ? '' : 's';
    return `${interval} ${unit}${suffix} ago`;
};

const units = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
    { label: 'second', seconds: 1 }
];

const calculateTimeDifference = (time: number) => {
    for (let { label, seconds } of units) {
        const interval = Math.floor(time / seconds);
        if (interval >= 1) {
            return {
                interval: interval,
                unit: label
            };
        }
    }
    return {
        interval: 0,
        unit: ''
    };
};