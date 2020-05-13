/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { TrialAppClient } from 'vscode-azureappservice';
import { AzExtParentTreeItem, AzExtTreeItem, GenericTreeItem, IActionContext, parseError } from 'vscode-azureextensionui';
import { ext } from '../../extensionVariables';
import { localize } from '../../localize';
import { getThemedIconPath } from '../../utils/pathUtils';
import { TrialAppFolderTreeItem } from './TrialAppFolderTreeItem';

/**
 * NOTE: This leverages a command with id `ext.prefix + '.startStreamingLogs'` that should be registered by each extension
 */
export class TrialAppLogFilesTreeItem extends TrialAppFolderTreeItem {
    public static contextValue: string = 'logFiles';
    public readonly contextValue: string = TrialAppLogFilesTreeItem.contextValue;

    protected readonly _isRoot: boolean = true;

    constructor(parent: AzExtParentTreeItem, client: TrialAppClient) {
        super(parent, localize('logFiles', 'Logs'), '/LogFiles', true, client);
    }

    public async loadMoreChildrenImpl(clearCache: boolean, context: IActionContext): Promise<AzExtTreeItem[]> {
        let children: AzExtTreeItem[];
        try {
            children = await super.loadMoreChildrenImpl(clearCache, context);
        } catch (error) {
            // We want to show the log stream tree item in all cases, so handle errors here
            const message: string = parseError(error).message;
            context.telemetry.properties.logFilesError = message;
            children = [new GenericTreeItem(this, {
                label: localize('errorTreeItem', 'Error: {0}', message),
                contextValue: 'logFilesError'
            })];
        }

        if (clearCache) {
            const ti: AzExtTreeItem = new GenericTreeItem(this, {
                contextValue: 'logStream',
                commandId: `${ext.prefix}.startStreamingLogs`,
                iconPath: getThemedIconPath('start-log'),
                label: localize('connectLogStream', 'Connect to Log Stream...')
            });
            ti.commandArgs = [this.parent]; // should be the slot tree item
            children.push(ti);
        }
        return children;
    }
}
