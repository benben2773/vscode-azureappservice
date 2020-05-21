/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { AzExtParentTreeItem } from 'vscode-azureextensionui';

export abstract class WebJobsTreeItemBase extends AzExtParentTreeItem {
    public static contextValue: string = 'webJobs';
    public readonly label: string = 'WebJobs';
    public readonly contextValue: string = WebJobsTreeItemBase.contextValue;
    public readonly childTypeLabel: string = 'Web Job';

    public get id(): string {
        return 'webJobs';
    }
}
