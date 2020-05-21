/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { SiteClient } from 'vscode-azureappservice';
import { AzExtParentTreeItem, AzExtTreeItem, GenericTreeItem } from 'vscode-azureextensionui';
import { getThemedIconPath, IThemedIconPath } from '../utils/pathUtils';
import { NotAvailableTreeItem } from './NotAvailableTreeItem';
import { WebJobsTreeItemBase } from './WebJobsTreeItemBase';

export class WebJobsTreeItem extends WebJobsTreeItemBase {

    public get iconPath(): IThemedIconPath {
        return getThemedIconPath('WebJobs_color');
    }

    private readonly _client: SiteClient;

    constructor(parent: AzExtParentTreeItem, client: SiteClient) {
        super(parent);
        this._client = client;
    }

    public hasMoreChildrenImpl(): boolean {
        return false;
    }

    public async loadMoreChildrenImpl(_clearCache: boolean): Promise<AzExtTreeItem[]> {
        return (await this._client.listWebJobs()).map((job: webJob) => {
            return new GenericTreeItem(this, { id: job.name, label: job.name, contextValue: 'webJob' });
        });
    }
}

export class WebJobsNATreeItem extends NotAvailableTreeItem {
    public static contextValue: string = "webJobsNA";
    public readonly label: string = 'WebJobs';
    public readonly contextValue: string = WebJobsNATreeItem.contextValue;

    public constructor(parent: AzExtParentTreeItem) {
        super(parent);
    }

    public get iconPath(): IThemedIconPath {
        return getThemedIconPath('WebJobs_grayscale');
    }

    public hasMoreChildrenImpl(): boolean {
        return false;
    }

    public async loadMoreChildrenImpl(_clearCache: boolean): Promise<AzExtTreeItem[]> {
        return [new GenericTreeItem(this, { label: 'WebJobs are not available for Linux Apps.', contextValue: 'webJobNA' })];
    }
}

type webJob = { name: string, Message: string };
