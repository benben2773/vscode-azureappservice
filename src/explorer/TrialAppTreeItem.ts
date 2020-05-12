/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as fse from 'fs-extra';
import * as path from 'path';
import { Disposable, MessageItem } from 'vscode';
import { ITrialAppMetadata, LinuxRuntimes, TrialAppClient, TrialAppDeploymentTreeItem, TrialAppFolderTreeItem, TrialAppLogFilesTreeItem, TrialAppSettingsTreeItem } from 'vscode-azureappservice';
import { ext } from 'vscode-azureappservice/out/src/extensionVariables';
import { requestUtils } from 'vscode-azureappservice/out/src/utils/requestUtils';
import { AzExtParentTreeItem, AzExtTreeItem, DialogResponses, IActionContext } from '../../extension.bundle';
import * as constants from '../constants';
import { venvUtils } from '../utils/venvUtils';
import { getWorkspaceSetting, updateWorkspaceSetting } from '../vsCodeConfig/settings';
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

    public loginSession: string;

    public token: string;

    public metadata: ITrialAppMetadata;

    public client: TrialAppClient;

    public root: TrialAppTreeItem;

    private readonly _appSettingsNode: TrialAppSettingsTreeItem;
    private readonly _deploymentsNode: TrialAppDeploymentTreeItem;
    private readonly _connectionsNode: TrialAppConnectionsTreeItem;
    private readonly _siteFilesNode: TrialAppFolderTreeItem;
    private readonly _logFilesNode: TrialAppLogFilesTreeItem;
    private readonly _disposables: Disposable[] = [];

    public constructor(parent: AzExtParentTreeItem, metadata: ITrialAppMetadata) {
        super(parent);
        this.metadata = metadata;
        this.client = new TrialAppClient(this.metadata.publishingUserName, this.metadata.publishingPassword, this.metadata);
        this.token = 'EAAAAK4YRbMTdIC65FnP0e8MEwnKQyJlulP37IzetQJCMa6gzn2IRONNkmChJSlKgdKdVy7/G9J8TWSS0a/X3/sLyJvSp6nOY43CqPXWTpaa9TAt3qTJrc+qbUz/ZPaRnd61UV5u48K99Mdqh7yxu4iwh4sBMEt29LjFzOgPf+m2NV1eKmIy7B8gI89ICtP9WacIA/CrYgjV8HOmMvfYcER8V2YnDYIJkL3zslAS/MkNrM9v+1jtGDd/tC2kAyI4+Dt+smYuEyENG6lYZnPmEh2KLu2Rqrg6J+WdFJzpE8ZGl/l7Q6pYnjChKpXyD1q8E4nRg1pL5OEwa9ga6fFZ+pv1KTyTOmfj9633+xyu1TA/OQzpNE2zlktWdJQP3jMqJYiRmXVH1/BIfaE0HCU35ZCEMXgfIdhbdGk/uI/Y5RlP4AfDNm5Ofsv+uxVwazzMYzmvUBp3O4MD/DrL/r5CkrHAVflCHKApd4zMSw2jPrgMLfvJ9emDS+5IdJUSBOtE3xImBmssTTAXx3t7HVc1+8t4cdr452ZSIg/f/rPeoRaJi63mQ/DkK/gzxwLtzxvZ+OmO92JkXQunWFMsLEPXGlgbDXeWiZVBxSgV4FBmj7qsgQH0p7fbGxOhvlB++uppmUJGoB+o67rkiPhojYdGRsp7A7/4Q+mw0i9I4FZ5/Osz2kmef6aXF8Snx7cI0t6l/5Muv/CbQfH3ukmFHm3VDZVgSEGzGUpNQxsIiAx25JCPrUpWxPnfrRuwHPzfJvanO4CNGzdQWdm75K0T5oSBl1txX6XFFk3Jf0x7lIhom2eDbVDVw4GyNxHMG1mntpbF8+1MNp9nAfsFvAZRObft1NSdADZ0MmJieU4Dou2LgehqVRiCkSvSP1/DCde//m+/2hf3Adb5ThgcQHyHywE85yxD9NVVeehKxt+DqJq/kH+Xh1ne8uKaJtNglWcPmPsJH6BvsX6Vw4wP2GSHjY6xvlL+o03r2tLmnMeO7qbzra5FtfcY29Kp6BR8iYqE5lwYCFjXkWD7rMi5zNtCCMAxmptfiB6KB1zpwo8Rrie7kl0v18ROhhMNXlIhTellJXZrqAJ2ZVs6TUikv0cRR9FDys5LKLneyOxZBtiS9poe9JlU2PP3jFRGNs0OOldbA16MKFTZSWQdWG0XI2WSoGoOLI3yqRpTkVMnLl4/Cze67uxGVCgo6s+LvghRHh3nMqPx6/knL0zL7FqSiM+AvHCdoHiGf9LhjxRNX+fp1/3UfBjRbMVvfaH5ypwCWfikMojgkJ4kvzln8UzfvAzYTQ9U94CewTLFLBhLOyDJWrRq3zM7SKo+vXx/ytlOo+1rLsjcOuOwaqBniwxpGHxyCUVMBTb+pEG7IKIxUCldF+WGDqkHsJauSZNcDzq3AVODb0G3vVgudCJ9Y653/WMtJsE8l0L+ys0dltysuIh9EyIHwkYNbfQoqCTXrJVdYvrgAWkevYgM+4fiEymVaga/Kbi7yNY30q4=';
        this._deploymentsNode = new TrialAppDeploymentTreeItem(this, this.client);
        this._logFilesNode = new TrialAppLogFilesTreeItem(this, this.client);
        this._appSettingsNode = new TrialAppSettingsTreeItem(this, this.client);
        this._siteFilesNode = new TrialAppFolderTreeItem(this, 'Files', '/site/wwwroot', false, this.client);
        this._connectionsNode = new TrialAppConnectionsTreeItem(this);
        this.root = this;
    }
    public dispose(): void {
        // tslint:disable-next-line: no-unsafe-any
        Disposable.from(...this._disposables).dispose();
    }

    public hasMoreChildrenImpl(): boolean {
        return false;
    }

    public async refresh(): Promise<void> {
        this.metadata = await this.getTrialAppMetaData();
    }

    public isAncestorOfImpl?(contextValue: string | RegExp): boolean {
        return false;
    }

    public async loadMoreChildrenImpl(_clearCache: boolean): Promise<AzExtTreeItem[]> {
        return [this._appSettingsNode, this._connectionsNode, this._deploymentsNode, this._siteFilesNode, this._logFilesNode, new TrialAppConvertTreeItem(this)];
    }

    public async promptScmDoBuildDeploy(fsPath: string, runtime: string, context: IActionContext): Promise<void> {
        context.telemetry.properties.enableScmInput = "Canceled";

        const learnMoreLink: string = 'https://aka.ms/Kwwkbd';

        const buildDuringDeploy: string = `Would you like to update your workspace configuration to run build commands on the target server? This should improve deployment performance.`;
        const input: MessageItem | undefined = await ext.ui.showWarningMessage(buildDuringDeploy, { modal: true, learnMoreLink }, DialogResponses.yes, DialogResponses.no);

        if (input === DialogResponses.yes) {
            await this.enableScmDoBuildDuringDeploy(fsPath, runtime);
            context.telemetry.properties.enableScmInput = "Yes";
        } else {
            await updateWorkspaceSetting(constants.configurationSettings.showBuildDuringDeployPrompt, false, fsPath);
            context.telemetry.properties.enableScmInput = "No";
        }
    }

    public async deleteTreeItemImpl(): Promise<void> {
        ext.outputChannel.appendLine(`Deleting; ${this.label} Trial app...`);

        const create: requestUtils.Request = await requestUtils.getDefaultRequest('https://tryappservice.azure.com/api/resource', this.client.credentials, 'DELETE');

        create.headers = {
            accept: "application/json,*/*",
            "accept-language": "en-US,en;q=0.9",
            authorization: ` Bearer ${this.token} `,
            "content-type": "application/json",
            "ms-x-user-agent": "VsCodeLinux/",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "cross-site"
        };

        const result: string = await requestUtils.sendRequest<string>(create);
        ext.outputChannel.appendLine(result);
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
            cookie: `loginsession = ${this.loginSession}`
        };

        // request.auth = { bearer: this.token, user: this.metadata.publishingUserName, username: this.metadata.publishingUserName, password: this.metadata.publishingPassword };

        try {

            await requestUtils.sendRequest<string>(request);

        } catch (e) {
            ext.outputChannel.appendLine(e);
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
            cookie: `loginsession = ${this.loginSession}`
        };

        try {

            const result: string = await requestUtils.sendRequest<string>(metadataRequest);
            return <ITrialAppMetadata>JSON.parse(result);

        } catch (e) {
            ext.outputChannel.appendLine(e);
            throw Error;
        }
    }

    public async enableScmDoBuildDuringDeploy(fsPath: string, runtime: string): Promise<void> {
        const zipIgnoreFolders: string[] = await this.getIgnoredFoldersForDeployment(fsPath, runtime);
        let oldSettings: string[] | string | undefined = getWorkspaceSetting(constants.configurationSettings.zipIgnorePattern, fsPath);
        if (!oldSettings) {
            oldSettings = [];
        } else if (typeof oldSettings === "string") {
            oldSettings = [oldSettings];
            // settings have to be an array to concat the proper zipIgnoreFolders
        }
        const newSettings: string[] = oldSettings;
        for (const folder of zipIgnoreFolders) {
            if (oldSettings.indexOf(folder) < 0) {
                newSettings.push(folder);
            }
        }
        await updateWorkspaceSetting(constants.configurationSettings.zipIgnorePattern, newSettings, fsPath);
        await fse.writeFile(path.join(fsPath, constants.deploymentFileName), constants.deploymentFile);
    }

    public async promptToSaveDeployDefaults(context: IActionContext, workspacePath: string, deployPath: string): Promise<void> {
        const defaultWebAppToDeploySetting: string | undefined = getWorkspaceSetting(constants.configurationSettings.defaultWebAppToDeploy, workspacePath);
        // only prompt if setting is unset
        if (!defaultWebAppToDeploySetting) {
            const saveDeploymentConfig: string = `Always deploy the workspace "${path.basename(workspacePath)}" to "${this.root.client.fullName}"?`;
            const dontShowAgain: MessageItem = { title: "Don't show again" };
            const result: MessageItem = await ext.ui.showWarningMessage(saveDeploymentConfig, DialogResponses.yes, dontShowAgain, DialogResponses.skipForNow);
            if (result === DialogResponses.yes) {
                await updateWorkspaceSetting(constants.configurationSettings.defaultWebAppToDeploy, this.fullId, deployPath);
                await updateWorkspaceSetting(constants.configurationSettings.deploySubpath, path.relative(workspacePath, deployPath), deployPath); // '' is a falsey value
                context.telemetry.properties.promptToSaveDeployConfigs = 'Yes';
            } else if (result === dontShowAgain) {
                await updateWorkspaceSetting(constants.configurationSettings.defaultWebAppToDeploy, constants.none, deployPath);
                context.telemetry.properties.promptToSaveDeployConfigs = "Don't show again";
            } else {
                context.telemetry.properties.promptToSaveDeployConfigs = 'Skip for now';
            }
        }
    }

    private async getIgnoredFoldersForDeployment(fsPath: string, runtime: string): Promise<string[]> {
        let ignoredFolders: string[];
        switch (runtime) {
            case LinuxRuntimes.node:
                ignoredFolders = ['node_modules{,/**}'];
                break;
            case LinuxRuntimes.python:
                let venvFsPaths: string[];
                try {
                    venvFsPaths = (await venvUtils.getExistingVenvs(fsPath)).map(venvPath => `${venvPath}{,/**}`);
                } catch (error) {
                    // if there was an error here, don't block-- just assume none could be detected
                    venvFsPaths = [];
                }

                // list of Python ignorables are pulled from here https://github.com/github/gitignore/blob/master/Python.gitignore
                // Byte-compiled / optimized / DLL files
                ignoredFolders = ['__pycache__{,/**}', '*.py[cod]', '*$py.class',
                    // Distribution / packaging
                    '.Python{,/**}', 'build{,/**}', 'develop-eggs{,/**}', 'dist{,/**}', 'downloads{,/**}', 'eggs{,/**}', '.eggs{,/**}', 'lib{,/**}', 'lib64{,/**}', 'parts{,/**}', 'sdist{,/**}', 'var{,/**}',
                    'wheels{,/**}', 'share/python-wheels{,/**}', '*.egg-info{,/**}', '.installed.cfg', '*.egg', 'MANIFEST'];

                // Virtual Environments
                const defaultVenvPaths: string[] = ['.env{,/**}', '.venv{,/**}', 'env{,/**}', 'venv{,/**}', 'ENV{,/**}', 'env.bak{,/**}', 'venv.bak{,/**}'];
                for (const venvPath of venvFsPaths) {
                    // don't add duplicates
                    if (!defaultVenvPaths.find(p => p === venvPath)) {
                        defaultVenvPaths.push(venvPath);
                    }
                }

                ignoredFolders = ignoredFolders.concat(defaultVenvPaths);
                break;
            default:
                ignoredFolders = [];
        }

        // add .vscode to the ignorePattern since it will never be needed for deployment
        ignoredFolders.push('.vscode{,/**}');
        return ignoredFolders;
    }
}
