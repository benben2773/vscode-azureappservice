/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as appservice from 'vscode-azureappservice';
import { IActionContext } from 'vscode-azureextensionui';
import { SiteTreeItem } from "../../explorer/SiteTreeItem";
import { TrialAppTreeItem } from '../../explorer/TrialAppTreeItem';
import { WebAppTreeItem } from '../../explorer/WebAppTreeItem';
import { ext } from '../../extensionVariables';
import { enableFileLogging } from './enableFileLogging';

export async function startStreamingLogs(context: IActionContext, node?: SiteTreeItem | TrialAppTreeItem): Promise<void> {
    if (!node) {
        node = await ext.tree.showTreeItemPicker<WebAppTreeItem>(WebAppTreeItem.contextValue, context);
    }

    const verifyLoggingEnabled: () => Promise<void> = async (): Promise<void> => {
        if (node instanceof SiteTreeItem) {
            await enableFileLogging({ ...context, suppressAlreadyEnabledMessage: true }, node);
        }
    };

    if (node instanceof TrialAppTreeItem) {
        await appservice.startStreamingLogs(node.client, verifyLoggingEnabled, `${node.metadata.siteName} - Log Stream`);
    } else {
        await appservice.startStreamingLogs(node.root.client, verifyLoggingEnabled, node.logStreamLabel);
    }
}
