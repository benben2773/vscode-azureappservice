/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IFileResult, TrialAppClient } from 'vscode-azureappservice';
import { AzExtTreeItem, openReadOnlyContent, TreeItemIconPath } from 'vscode-azureextensionui';
import KuduClient from 'vscode-azurekudu';
import { ext } from '../../extensionVariables';
import { localize } from '../../localize';
import { getThemedIconPath } from '../../utils/pathUtils';
import { TrialAppFolderTreeItem } from './TrialAppFolderTreeItem';
/**
 * NOTE: This leverages a command with id `ext.prefix + '.openFile'` that should be registered by each extension
 */
export class TrialAppFileTreeItem extends AzExtTreeItem {

    public get commandId(): string {
        return `${ext.prefix}.openFile`;
    }
    public static contextValue: string = 'file';
    public readonly contextValue: string = TrialAppFileTreeItem.contextValue;
    public readonly label: string;
    public readonly path: string;
    public readonly isReadOnly: boolean;
    public client: TrialAppClient;

    public root: TrialAppFileTreeItem;

    // @ts-ignore
    constructor(parent: TrialAppFolderTreeItem, label: string, path: string, isReadOnly: boolean, client: TrialAppClient) {
        super(parent);
        this.label = label;
        this.path = path;
        this.isReadOnly = isReadOnly;
        this.client = client;
        this.root = this;
    }

    public get iconPath(): TreeItemIconPath {
        return getThemedIconPath('file');
    }

    public async openReadOnly(): Promise<void> {
        await this.runWithTemporaryDescription(localize('opening', 'Opening...'), async () => {
            const kuduClient: KuduClient = await this.client.getKuduClient();
            // tslint:disable:no-unsafe-any
            // tslint:disable-next-line:no-any
            const response: any = (<any>await kuduClient.vfs.getItemWithHttpOperationResponse(this.path)).response;
            if (response && response.headers && response.headers.etag) {
                const result: IFileResult = { data: response.body, etag: response.headers.etag };
                await openReadOnlyContent(this, result.data, '');
            }
        });
    }
}
