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
    if (illegalSymbols.some((el) => fileName.contains(el))) {
        illegalSymbols.forEach((ilSymbol) => {
            fileName = fileName.replace(ilSymbol, '');
        });

        return fileName;
    } else {
        return fileName;
    }
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