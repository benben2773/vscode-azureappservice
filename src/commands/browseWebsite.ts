/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IActionContext } from "vscode-azureextensionui";
import { SiteTreeItem } from "../explorer/SiteTreeItem";
import { TrialAppTreeItem } from '../explorer/TrialAppTreeItem';
import { WebAppTreeItem } from "../explorer/WebAppTreeItem";
import { ext } from "../extensionVariables";
import { openUrl } from "../utils/openUrl";

export async function browseWebsite(context: IActionContext, node?: SiteTreeItem | TrialAppTreeItem): Promise<void> {

    if (!node) {
        node = await ext.tree.showTreeItemPicker<WebAppTreeItem>(WebAppTreeItem.contextValue, context);
    }

    if (node instanceof TrialAppTreeItem) {
        await openUrl(node.metadata.url);
    } else {
        await openUrl(node.root.client.defaultHostUrl);
    }
}
