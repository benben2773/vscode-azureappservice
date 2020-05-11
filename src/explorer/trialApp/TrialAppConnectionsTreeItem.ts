/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ISiteTreeRoot } from 'vscode-azureappservice';
import { AzExtParentTreeItem, AzExtTreeItem, AzureTreeItem } from 'vscode-azureextensionui';
import { getThemedIconPath, IThemedIconPath } from '../../utils/pathUtils';
import { TrialAppTreeItem } from '../TrialAppTreeItem';
import { CosmosDBConnection } from './../CosmosDBConnection';
import { CosmosDBTreeItem } from './../CosmosDBTreeItem';

export class TrialAppConnectionsTreeItem extends AzExtParentTreeItem {
    public static contextValue: string = 'connections';
    public readonly contextValue: string = TrialAppConnectionsTreeItem.contextValue;
    public readonly label: string = 'Connections';
    public readonly parent: TrialAppTreeItem;

    private readonly _cosmosDBNode: CosmosDBTreeItem;

    constructor(parent: TrialAppTreeItem) {
        super(parent);
        this.parent = parent;
        this._cosmosDBNode = new CosmosDBTreeItem(this);
    }

    public get iconPath(): IThemedIconPath {
        return getThemedIconPath('Connections_16x');
    }

    public async loadMoreChildrenImpl(_clearCache: boolean): Promise<AzureTreeItem<ISiteTreeRoot>[]> {
        return [this._cosmosDBNode];
    }

    public async pickTreeItemImpl(expectedContextValues: (string | RegExp)[]): Promise<AzExtTreeItem | undefined> {
        for (const expectedContextValue of expectedContextValues) {
            switch (expectedContextValue) {
                case CosmosDBTreeItem.contextValueInstalled:
                case CosmosDBTreeItem.contextValueNotInstalled:
                case CosmosDBConnection.contextValue:
                    return this._cosmosDBNode;
                default:
            }
        }

        return undefined;
    }

    public hasMoreChildrenImpl(): boolean {
        return false;
    }
}
