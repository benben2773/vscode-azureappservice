/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Disposable } from 'vscode';
import { AppSettingsTreeItem, LogFilesTreeItem, TrialAppDeploymentTreeItem, TrialAppFolderTreeItem } from 'vscode-azureappservice';
import { ext } from 'vscode-azureappservice/out/src/extensionVariables';
import { AzExtParentTreeItem, AzExtTreeItem, IGenericTreeItemOptions } from 'vscode-azureextensionui';
import { ConnectionsTreeItem } from './ConnectionsTreeItem';
import { TrialAppTreeItemBase } from './TrialAppTreeItemBase';
import { WebJobsNATreeItem, WebJobsTreeItem } from './WebJobsTreeItem';

export class TrialAppTreeItem extends TrialAppTreeItemBase {

    public static contextValue: string = 'trialAppContext';
    public label: string;
    public isReadOnly: boolean;

    public readonly appSettingsNode: AppSettingsTreeItem;
    public deploymentsNode: TrialAppDeploymentTreeItem;
    private readonly _connectionsNode: ConnectionsTreeItem;
    private readonly _siteFilesNode: TrialAppFolderTreeItem;
    private readonly _logFilesNode: LogFilesTreeItem;
    private readonly _webJobsNode: WebJobsTreeItem | WebJobsNATreeItem;
    private readonly _disposables: Disposable[] = [];

    public constructor(parent: AzExtParentTreeItem, options: IGenericTreeItemOptions) {
        super(parent, options);
        this.label = 'NodeJS Trial App';
        this.appSettingsNode = new AppSettingsTreeItem(this);
        // this._connectionsNode = new ConnectionsTreeItem(null);
        this.deploymentsNode = new TrialAppDeploymentTreeItem(this);
        this._siteFilesNode = new TrialAppFolderTreeItem(parent, 'Web app files', '.', false);
    }
    public dispose(): void {
        // tslint:disable-next-line: no-unsafe-any
        Disposable.from(...this._disposables).dispose();
    }

    public hasMoreChildrenImpl(): boolean {
        return false;
    }

    public async loadMoreChildrenImpl(_clearCache: boolean): Promise<AzExtTreeItem[]> {
        return [this.appSettingsNode, this.deploymentsNode, this._siteFilesNode];
    }

    public async deleteTreeItemImpl(): Promise<void> {
        ext.outputChannel.appendLine('Deleting trial app...');
    }

}
