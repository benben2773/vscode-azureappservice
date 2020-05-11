/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ISiteTreeRoot } from 'vscode-azureappservice';
import { AzExtTreeItem, AzureParentTreeItem, AzureTreeItem } from 'vscode-azureextensionui';
import { getThemedIconPath, IThemedIconPath } from '../utils/pathUtils';
import { CosmosDBConnection } from './CosmosDBConnection';
import { CosmosDBTreeItem } from './CosmosDBTreeItem';
import { SiteTreeItem } from './SiteTreeItem';
import { TrialAppTreeItem } from './TrialAppTreeItem';

export class ConnectionsTreeItem extends AzureParentTreeItem<ISiteTreeRoot> {
    public static contextValue: string = 'connections';
    public readonly contextValue: string = ConnectionsTreeItem.contextValue;
    public readonly label: string = 'Connections';
    public readonly parent: SiteTreeItem;

    private readonly _cosmosDBNode: CosmosDBTreeItem;

    constructor(parent: SiteTreeItem | TrialAppTreeItem) {
        super(parent);
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
