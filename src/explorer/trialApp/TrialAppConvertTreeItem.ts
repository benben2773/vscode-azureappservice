/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { AzExtTreeItem } from 'vscode-azureextensionui';
import { TrialAppTreeItem } from '../TrialAppTreeItem';

export class TrialAppConvertTreeItem extends AzExtTreeItem {
    public static contextValue: string = 'transfer';
    public readonly contextValue: string = TrialAppConvertTreeItem.contextValue;
    public readonly label: string = 'Transfer to subscription...';
    public readonly parent: TrialAppTreeItem;

    constructor(parent: TrialAppTreeItem) {
        super(parent);
        this.parent = parent;
    }
}
