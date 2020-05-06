/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { AzExtParentTreeItem, GenericTreeItem, IGenericTreeItemOptions } from 'vscode-azureextensionui';
import { getIconPath } from '../utils/pathUtils';

export abstract class TrialAppTreeItemBase extends GenericTreeItem {

    public minutesRemaining: number = 60;
    public parent: AzExtParentTreeItem;
    public readonly name: string;

    public abstract isReadOnly: boolean;

    public childTypeLabel: string = 'trialApp';
    public description: string = `${this.minutesRemaining} min. remaining`;
    public constructor(parent: AzExtParentTreeItem, options: IGenericTreeItemOptions) {
        super(parent, options);
        this.contextValue = 'trialAppContext';
        this.id = 'trialApp';
        this.iconPath = getIconPath('WebApp');
    }
}
