/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { TrialAppMetadata } from 'vscode-azureappservice';
import { AzExtTreeItem, AzureAccountTreeItemBase, GenericTreeItem, IActionContext, ISubscriptionContext } from 'vscode-azureextensionui';
import { ext } from '../extensionVariables';
import { localize } from '../localize';
import { getIconPath } from '../utils/pathUtils';
import { requestUtils } from '../utils/requestUtils';
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

        const children: AzExtTreeItem[] = await super.loadMoreChildrenImpl(clearCache, context);

        const hasTrialApp: boolean | undefined = ext.context.globalState.get('appServiceTrialMode');

        if (!hasTrialApp && children.length > 0 && children[0] instanceof GenericTreeItem) {

            const ti: GenericTreeItem = new GenericTreeItem(this, {
                label: localize('createNewTrialApp', 'Create free NodeJS Trial App...'),
                commandId: 'appService.CreateTrialApp',
                contextValue: 'createTrialApp',
                iconPath: getIconPath('CreateNewProject'),
                includeInTreeItemPicker: true
            });

            ti.commandArgs = [];
            children.push(ti);
        }

        if (ext.context.globalState.get('appServiceTrialMode') === true) {
            const session: string | undefined = ext.context.globalState.get('trialApp.loginsession');
            if (session) {
                const metadata: TrialAppMetadata = await this.getTrialAppMetaData(session);
                const trialAppNode = new TrialAppTreeItem(this, metadata);
                const token: string | undefined = ext.context.globalState.get('trialAppBearerToken');

                if (token !== undefined) {
                    trialAppNode.token = token;
                }

                children.push(trialAppNode);
            }
        }

        return children;
    }

    public compareChildrenImpl(item1: AzExtTreeItem, item2: AzExtTreeItem): number {
        if (!(item1 instanceof SubscriptionTreeItem) && item2 instanceof SubscriptionTreeItem) {
            return -1; // trial apps on top of subscriptions
        }
        return super.compareChildrenImpl(item1, item2);
    }

    private async getTrialAppMetaData(loginsession: string): Promise<TrialAppMetadata> {
        const metadataRequest: requestUtils.Request = await requestUtils.getDefaultRequest('https://tryappservice.azure.com/api/vscoderesource', undefined, 'GET');

        metadataRequest.headers = {
            accept: "*/*",
            "accept-language": "en-US,en;q=0.9",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            cookie: `loginsession=${loginsession}`
        };

        try {
            const result: string = await requestUtils.sendRequest<string>(metadataRequest);
            ext.outputChannel.appendLine(String(result));
            return <TrialAppMetadata>JSON.parse(result);

        } catch (e) {
            ext.outputChannel.appendLine(e);
            throw Error;
        }
    }
}
