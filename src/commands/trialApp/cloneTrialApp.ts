/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { commands } from 'vscode';
import { IActionContext } from "vscode-azureextensionui";
import { TrialAppTreeItem } from "../../explorer/TrialAppTreeItem";
import { ext } from "../../extensionVariables";

export async function cloneTrialApp(context: IActionContext, node?: TrialAppTreeItem): Promise<void> {
    if (!node) {
        node = await ext.tree.showTreeItemPicker<TrialAppTreeItem>(TrialAppTreeItem.contextValue, context);
    }
    commands.executeCommand('git.clone', node.client.metadata.gitUrl);
}
