/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { AzExtParentTreeItem, IGenericTreeItemOptions } from 'vscode-azureextensionui';
import { getIconPath } from '../utils/pathUtils';

export abstract class TrialAppTreeItemBase extends AzExtParentTreeItem {

    public timeLeft: number = 60;
    public parent: AzExtParentTreeItem;
    public readonly name: string;
    public contextValue: string = 'trialAppContext';
    public childTypeLabel: string = 'trialApp';
    public description: string = `${this.timeLeft} min. remaining`;
    public constructor(parent: AzExtParentTreeItem, options: IGenericTreeItemOptions) {
        super(parent);
        this.id = 'trialApp';
        this.iconPath = getIconPath('WebApp');
    }
}
