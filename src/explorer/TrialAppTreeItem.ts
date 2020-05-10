/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Disposable } from 'vscode';
import { LogFilesTreeItem, TrialAppClient, TrialAppDeploymentTreeItem, TrialAppFolderTreeItem, TrialAppMetadata, TrialAppSettingsTreeItem } from 'vscode-azureappservice';
import { ext } from 'vscode-azureappservice/out/src/extensionVariables';
import { AzExtParentTreeItem, AzExtTreeItem } from 'vscode-azureextensionui';
import KuduClient from 'vscode-azurekudu';
import { requestUtils } from '../utils/requestUtils';
import { ConnectionsTreeItem } from './ConnectionsTreeItem';
import { TrialAppTreeItemBase } from './TrialAppTreeItemBase';
import { WebJobsNATreeItem, WebJobsTreeItem } from './WebJobsTreeItem';

export class TrialAppTreeItem extends TrialAppTreeItemBase {
    public get label(): string {
        return this.metadata.siteName ? this.metadata.siteName : 'NodeJS Trial App';
    }

    public static contextValue: string = 'trialApp';
    public isReadOnly: boolean;

    public loginSession: string;

    public token: string;

    public metadata: TrialAppMetadata;

    public appSettingsNode: TrialAppSettingsTreeItem;
    public deploymentsNode: TrialAppDeploymentTreeItem;
    private readonly _connectionsNode: ConnectionsTreeItem;
    private siteFilesNode: TrialAppFolderTreeItem;
    private readonly _logFilesNode: LogFilesTreeItem;
    private readonly _webJobsNode: WebJobsTreeItem | WebJobsNATreeItem;
    private readonly _disposables: Disposable[] = [];

    private client: TrialAppClient;

    public constructor(parent: AzExtParentTreeItem, metadata: TrialAppMetadata) {
        super(parent);
        this.metadata = metadata;
        this.client = new TrialAppClient(this.metadata.publishingUserName, this.metadata.publishingPassword, this.metadata);
        // this._connectionsNode = new ConnectionsTreeItem(null);
        this.deploymentsNode = new TrialAppDeploymentTreeItem(this);
        this.token = 'EAAAALYMrHVY7rdIfvYzuOLbZeaQaJciuWOJXN4Ssr/epSR9tlr8Dxqdf1H7LfRDnH8cCyG40ogG2Ph/lctQ59mpStvgEcdUX1eDasiWCP8uD/l8O6+CGwWi0d6lKRUMdK/ScxkcS5Cw/uIH8Gh1fK+gYi30UqkQzfl/PWOFZ8DWrKuV9PVlvL3lAkTv6w0kCzn53rZUAELp1B0pk85QyDXqRVZrppEX4QtqE0Cr6WgDGfXRyivH+N95nX0+GQpfgZ0IdOzKS2SH8OSQicbPdH/2ZHG0jJ5y7pzDgOjOXj6DvCQhG8wYonIy1SMVW0u60DNDjdTv+PAKTAa/cJAL1ArJCeFWTlEZVizotXVyE5hNQn8K7jy+Mv4dYMUGe7jo7q8WSg89FyiByP5gRAM3Y30XYW1bH3ua4AjBwk6d7h/aeRpjbv5rdutL6qGjrbh5XspZQeSHwNWMq26CcKqPcfYmmBbq33oJ/KDNa4xiQ18VBBcC0+t8gc402i1xrDwvTuprhGBIe+ANfUvWkr2FIhCwiIFNKNtcPwdNebeX8M8Dz26vt/QDf9DaSQAu6qBqAxiRNeSNnXITn0tRKkMNqXoxTJynAHppBaBXJVK9sbGZXNEO9bpEeaPJNOXOpOOmTQVj3N9vN0rklYey0cLPnMuDHKp7FsXWWggog2zvZ4nh+ZCnJ5fIRzJah0yBsEHm8kz4nHArllO55m5yg0aq5W+XeywU4FqCdT/hYwibnJw3wt8dyHY76X0ozJ27J61IsSwSqOhc1DRYOeH/R54VuU+LD5t3tYENFRm6Ibykqi+InrBgnaUzb+YSOHjEXKelR2sw3aXooKPrF8a5ERoIvwntwaU6YX9I2u9doNWTloxf2dQWbnyy8dG+sHx1dl8HSmuFqziXLIFtVKGEOFx9/4njeOYpEHo2jKe+tMvIWNvsmIpLxAXvapv3rOmr87ggjPVPXBfMRVHA8hn73pz3OpVf3EQF7bvLWsk+gjQ0W1aKbFXatD3qh/gTRnLj74W/yzX+nC+7Pl9ISthuzwsLVkJrRMKbMxy6PvemTbuqZ6W87ijY93uh1L1iImrcnYxACUYjCIAOa7mBLlcu0xBb68rYwHWQPOEhztU4FHXGFkfZzhaTdib7HSkv5iGJfCNVhEv5lSEOixTpQv1Q2UqLtXi28kOA8OEJpeZNaLZd2scQPCYSTvz5oJtNdBR7U6dz4p/ec88trxDIXG9Z3SLT3C1zC8U8nYG6HzLlFV2haO2bLG/fmQfsKH8UUP3quVcUVEYqhz3JiB25pPDX8BhokWmXs69qI5mpp5GAMJNq3mCZC7DH';
    }
    public dispose(): void {
        // tslint:disable-next-line: no-unsafe-any
        Disposable.from(...this._disposables).dispose();
    }

    public hasMoreChildrenImpl(): boolean {
        return false;
    }

    public async loadMoreChildrenImpl(_clearCache: boolean): Promise<AzExtTreeItem[]> {
        const kuduClient: KuduClient = await this.client.getKuduClient();
        this.appSettingsNode = new TrialAppSettingsTreeItem(this, kuduClient);
        this.siteFilesNode = new TrialAppFolderTreeItem(this, 'Files', '/site/wwwroot', false, kuduClient);
        return [this.appSettingsNode, this.deploymentsNode, this.siteFilesNode];
    }

    public async deleteTreeItemImpl(): Promise<void> {
        ext.outputChannel.appendLine(`Deleting ${this.label} Trial app...`);

        const create: requestUtils.Request = await requestUtils.getDefaultRequest('https://tryappservice.azure.com/api/resource', this.client.credentials, 'DELETE');

        create.headers = {
            accept: "application/json,*/*",
            "accept-language": "en-US,en;q=0.9",
            authorization: `Bearer ${this.token}`,
            "content-type": "application/json",
            "ms-x-user-agent": "VsCodeLinux/",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "cross-site"
        };

        try {
            const result: string = await requestUtils.sendRequest<string>(create);
            ext.outputChannel.appendLine(result);

        } catch (e) {
            ext.outputChannel.appendLine(e);
            throw Error;
        }
    }

    public async extendTrialApp(): Promise<void> {
        const request: requestUtils.Request = await requestUtils.getDefaultRequest('https://tryappservice.azure.com/api/resource/extend', this.client.credentials, 'POST');

        request.headers = {
            accept: "*/*",
            "accept-language": "en-US,en;q=0.9",
            "sec-fetch-dest": "empty",
            authorization: `Bearer ${this.token}`,
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            cookie: `loginsession=${this.loginSession}`
        };

        request.auth = { bearer: this.token, user: this.metadata.publishingUserName, username: this.metadata.publishingUserName, password: this.metadata.publishingPassword };

        try {

            await requestUtils.sendRequest<string>(request);

        } catch (e) {
            ext.outputChannel.appendLine(e);
        }
    }

    private async getTrialAppMetaData(): Promise<TrialAppMetadata> {
        const metadataRequest: requestUtils.Request = await requestUtils.getDefaultRequest('https://tryappservice.azure.com/api/vscoderesource', undefined, 'GET');

        metadataRequest.headers = {
            accept: "*/*",
            "accept-language": "en-US,en;q=0.9",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            cookie: `loginsession=${this.loginSession}`
        };

        try {

            const result: string = await requestUtils.sendRequest<string>(metadataRequest);
            return <TrialAppMetadata>JSON.parse(result);

        } catch (e) {
            ext.outputChannel.appendLine(e);
            throw Error;
        }
    }
}
