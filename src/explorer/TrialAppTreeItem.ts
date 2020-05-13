/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Disposable } from 'vscode';
import { ITrialAppMetadata, TrialAppClient, TrialAppDeploymentTreeItem, TrialAppFolderTreeItem, TrialAppLogFilesTreeItem, TrialAppSettingsTreeItem } from 'vscode-azureappservice';
import { ext } from 'vscode-azureappservice/out/src/extensionVariables';
import { requestUtils } from 'vscode-azureappservice/out/src/utils/requestUtils';
import { AzExtParentTreeItem, AzExtTreeItem } from '../../extension.bundle';
import { TrialAppConnectionsTreeItem } from './trialApp/TrialAppConnectionsTreeItem';
import { TrialAppConvertTreeItem } from './trialApp/TrialAppConvertTreeItem';
import { TrialAppTreeItemBase } from './TrialAppTreeItemBase';

export class TrialAppTreeItem extends TrialAppTreeItemBase {
    public get label(): string {
        return this.metadata.siteName ? this.metadata.siteName : 'NodeJS Trial App';
    }

    public get description(): string {
        const minutesLeft: number = this.metadata.timeLeft / 60;
        return (isNaN(minutesLeft)) ? 'Expired' : `${minutesLeft.toFixed(0)} min. remaining`;
    }

    public static contextValue: string = 'trialApp';
    public isReadOnly: boolean;
    public metadata: ITrialAppMetadata;

    public client: TrialAppClient;

    public root: TrialAppTreeItem = this;

    private readonly _appSettingsNode: TrialAppSettingsTreeItem;
    private readonly _deploymentsNode: TrialAppDeploymentTreeItem;
    private readonly _connectionsNode: TrialAppConnectionsTreeItem;
    private readonly _siteFilesNode: TrialAppFolderTreeItem;
    private readonly _logFilesNode: TrialAppLogFilesTreeItem;
    private readonly _disposables: Disposable[] = [];

    constructor(parent: AzExtParentTreeItem, metadata: ITrialAppMetadata) {
        super(parent);

        this.metadata = metadata;
        this.client = new TrialAppClient(this.metadata.publishingUserName, this.metadata.publishingPassword, this.metadata);
        this._deploymentsNode = new TrialAppDeploymentTreeItem(this, this.client);
        this._logFilesNode = new TrialAppLogFilesTreeItem(this, this.client);
        this._appSettingsNode = new TrialAppSettingsTreeItem(this, this.client);
        this._siteFilesNode = new TrialAppFolderTreeItem(this, 'Files', '/site/wwwroot', false, this.client);
        this._connectionsNode = new TrialAppConnectionsTreeItem(this);
    }

    public dispose(): void {
        // tslint:disable-next-line: no-unsafe-any
        Disposable.from(...this._disposables).dispose();
    }

    public hasMoreChildrenImpl(): boolean {
        return false;
    }

    public async refreshImpl(): Promise<void> {
        this.metadata = await this.getTrialAppMetaData();
    }

    public isAncestorOfImpl?(_contextValue: string | RegExp): boolean {
        return false;
    }

    public async loadMoreChildrenImpl(_clearCache: boolean): Promise<AzExtTreeItem[]> {
        return [this._appSettingsNode, this._connectionsNode, this._deploymentsNode, this._siteFilesNode, this._logFilesNode, new TrialAppConvertTreeItem(this)];
    }

    public async deleteTreeItemImpl(): Promise<void> {
        ext.outputChannel.appendLine(`Deleting; ${this.label} Trial app...`);

        const create: requestUtils.Request = await requestUtils.getDefaultRequest('https://tryappservice.azure.com/api/resource', this.client.credentials, 'DELETE');

        create.headers = {
            accept: "application/json,*/*",
            "accept-language": "en-US,en;q=0.9",
            "content-type": "application/json",
            "ms-x-user-agent": "VsCodeLinux/",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "cross-site"
        };

        await requestUtils.sendRequest<string>(create);
    }

    public async extendTrialApp(): Promise<void> {
        const request: requestUtils.Request = await requestUtils.getDefaultRequest('https://tryappservice.azure.com/api/resource/extend', this.client.credentials, 'POST');

        request.headers = {
            accept: "*/*",
            "accept-language": "en-US,en;q=0.9",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            cookie: `loginsession = ${this.metadata.loginSession}`
        };

        request.auth = { username: this.metadata.publishingUserName, password: this.metadata.publishingPassword };

        try {

            await requestUtils.sendRequest<string>(request);

        } catch (error) {
            throw error;
        }
    }

    public async getTrialAppMetaData(): Promise<ITrialAppMetadata> {
        const metadataRequest: requestUtils.Request = await requestUtils.getDefaultRequest('https://tryappservice.azure.com/api/vscoderesource', undefined, 'GET');

        metadataRequest.headers = {
            accept: "*/*",
            "accept-language": "en-US,en;q=0.9",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            cookie: `loginsession=${this.metadata.loginSession}`
        };

        try {
            const result: string = await requestUtils.sendRequest<string>(metadataRequest);
            return <ITrialAppMetadata>JSON.parse(result);
        } catch (error) {
            throw error;
        }
    }
}
