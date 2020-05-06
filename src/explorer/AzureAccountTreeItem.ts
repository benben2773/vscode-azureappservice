/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { AzExtTreeItem, AzureAccountTreeItemBase, IActionContext, ISubscriptionContext } from 'vscode-azureextensionui';
import { ext } from '../extensionVariables';
import { getIconPath } from '../utils/pathUtils';
import { SubscriptionTreeItem } from './SubscriptionTreeItem';
import { TrialAppTreeItem } from './TrialAppTreeItem';

export class AzureAccountTreeItem extends AzureAccountTreeItemBase {
    public constructor(testAccount?: {}) {
        super(undefined, testAccount);
    }

    public createSubscriptionTreeItem(root: ISubscriptionContext): SubscriptionTreeItem {
        return new SubscriptionTreeItem(this, root);
    }

    public async loadMoreChildrenImpl(clearCache: boolean, context: IActionContext): Promise<AzExtTreeItem[]> {

        const existingChildren: AzExtTreeItem[] = await super.loadMoreChildrenImpl(clearCache, context);

        let children: AzExtTreeItem[];

        if (ext.context.globalState.get('appServiceTrialMode') === true) {
            existingChildren.unshift(new TrialAppTreeItem(this, { label: 'Trial App Name', contextValue: 'trialAppContext', iconPath: getIconPath('WebApp'), includeInTreeItemPicker: false }));

            children = existingChildren.filter(child => child.commandId !== 'appService.CreateTrialApp');

            return children;
        }

        return existingChildren;
    }

    public compareChildrenImpl(item1: AzExtTreeItem, item2: AzExtTreeItem): number {
        if (item2 instanceof TrialAppTreeItem) {
            return 1; // trial apps on top
        }
        return super.compareChildrenImpl(item1, item2);
    }
}
