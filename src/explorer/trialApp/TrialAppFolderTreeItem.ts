/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { AzExtParentTreeItem, AzExtTreeItem, AzureTreeItem, IActionContext, TreeItemIconPath } from 'vscode-azureextensionui';
import { localize } from '../../localize';
import { getThemedIconPath } from '../../utils/pathUtils';

export class TrialAppFolderTreeItem extends AzureTreeItem {
    public static contextValue: string = 'folder';
    public readonly contextValue: string = TrialAppFolderTreeItem.contextValue;
    public readonly childTypeLabel: string = localize('fileOrFolder', 'file or folder');
    public readonly label: string;
    public readonly path: string;
    public readonly isReadOnly: boolean;
    protected readonly _isRoot: boolean = false;

    constructor(parent: AzExtParentTreeItem, label: string, path: string, isReadOnly: boolean) {
        super(parent);
        this.label = label;
        this.path = path;
        this.isReadOnly = isReadOnly;
    }

    public get iconPath(): TreeItemIconPath {
        return getThemedIconPath('folder');
    }

    public hasMoreChildrenImpl(): boolean {
        return false;
    }

    public get description(): string | undefined {
        return 'folder';
    }

    public async loadMoreChildrenImpl(_clearCache: boolean, _context: IActionContext): Promise<AzExtTreeItem[]> {
        return Promise.resolve([]);
    }
}
