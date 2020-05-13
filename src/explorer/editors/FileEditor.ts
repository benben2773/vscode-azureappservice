/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { FileTreeItem, getFile, IFileResult, putFile } from 'vscode-azureappservice';
import { BaseEditor, IParsedError, parseError } from 'vscode-azureextensionui';
import KuduClient from 'vscode-azurekudu';
import { ext } from '../../extensionVariables';
import { localize } from '../../localize';
import { nonNullValue } from '../../utils/nonNull';
import { TrialAppFileTreeItem } from '../trialApp/TrialAppFileTreeItem';

export class FileEditor extends BaseEditor<FileTreeItem> {
    private _etags: Map<string, string> = new Map<string, string>();

    constructor() {
        super(`${ext.prefix}.showSavePrompt`);
    }

    public async getSaveConfirmationText(node: FileTreeItem | TrialAppFileTreeItem): Promise<string> {
        return `Saving '${node.label}' will update the file "${node.label}" in "${node.root.client.fullName}".`;
    }

    public async getFilename(node: FileTreeItem): Promise<string> {
        return node.label;
    }

    public async getResourceName(node: FileTreeItem): Promise<string> {
        return node.root.client.fullName;
    }

    public async getData(node: FileTreeItem | TrialAppFileTreeItem): Promise<string> {
        if (node instanceof FileTreeItem) {
            const result: IFileResult = await getFile(node.root.client, node.path);
            this._etags.set(node.fullId, result.etag);
            return result.data;
        } else {
            const kuduClient: KuduClient = await node.client.getKuduClient();
            // tslint:disable:no-unsafe-any
            // tslint:disable-next-line:no-any
            const response: any = (<any>await kuduClient.vfs.getItemWithHttpOperationResponse(node.path)).response;
            if (response && response.headers && response.headers.etag) {
                const result: IFileResult = { data: response.body, etag: response.headers.etag };
                this._etags.set(node.fullId, result.etag);
                return result.data;
                // tslint:enable:no-unsafe-any
            } else {
                throw new Error(localize('failedToFindFile', 'Failed to find file with path "{0}".', node.path));
            }
        }
    }

    public async getSize(_node: FileTreeItem): Promise<number> {
        // this is not implemented for Azure App Services
        return 0;
    }

    public async updateData(node: FileTreeItem, data: string): Promise<string> {
        let etag: string = nonNullValue(this._etags.get(node.fullId), 'etag');
        try {
            await putFile(node.root.client, data, node.path, etag);
        } catch (error) {
            const parsedError: IParsedError = parseError(error);
            if (parsedError.errorType === '412' && /etag/i.test(parsedError.message)) {
                throw new Error(`ETag does not represent the latest state of the file "${node.label}". Download the file from Azure to get the latest version.`);
            }
            throw error;
        }

        etag = (await getFile(node.root.client, node.path)).etag;
        this._etags.set(node.fullId, etag);
        return await this.getData(node);
    }
}
