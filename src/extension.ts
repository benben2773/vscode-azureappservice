/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import * as vscode from 'vscode';
import { registerAppServiceExtensionVariables } from 'vscode-azureappservice';
import { AzExtTreeDataProvider, AzureUserInput, callWithTelemetryAndErrorHandling, createApiProvider, createAzExtOutputChannel, IActionContext, IAzureUserInput, registerUIExtensionVariables } from 'vscode-azureextensionui';
import { AzureExtensionApi, AzureExtensionApiProvider } from 'vscode-azureextensionui/api';
import { revealTreeItem } from './commands/api/revealTreeItem';
import { registerCommands } from './commands/registerCommands';
import { AzureAccountTreeItem } from './explorer/AzureAccountTreeItem';
import { FileEditor } from './explorer/editors/FileEditor';
import { ext } from './extensionVariables';
import { ImportHandler } from './ImportHandler';

// tslint:disable-next-line:export-name
// tslint:disable-next-line:max-func-body-length
export async function activateInternal(
    context: vscode.ExtensionContext,
    perfStats: {
        loadStartTime: number, loadEndTime: number
    },
    ignoreBundle?: boolean
): Promise<AzureExtensionApiProvider> {
    ext.context = context;
    ext.ignoreBundle = ignoreBundle;

    const ui: IAzureUserInput = new AzureUserInput(context.globalState);
    ext.ui = ui;

    ext.outputChannel = createAzExtOutputChannel("Azure App Service", ext.prefix);
    context.subscriptions.push(ext.outputChannel);

    registerUIExtensionVariables(ext);
    registerAppServiceExtensionVariables(ext);

    // tslint:disable-next-line:max-func-body-length
    await callWithTelemetryAndErrorHandling('appService.activate', async (activateContext: IActionContext) => {
        activateContext.telemetry.properties.isActivationEvent = 'true';
        activateContext.telemetry.measurements.mainFileLoad = (perfStats.loadEndTime - perfStats.loadStartTime) / 1000;

        ext.azureAccountTreeItem = new AzureAccountTreeItem();
        context.subscriptions.push(ext.azureAccountTreeItem);
        ext.tree = new AzExtTreeDataProvider(ext.azureAccountTreeItem, 'appService.LoadMore');

        ext.treeView = vscode.window.createTreeView('azureAppService', { treeDataProvider: ext.tree, showCollapseAll: true });
        context.subscriptions.push(ext.treeView);

        ext.fileEditor = new FileEditor();
        context.subscriptions.push(ext.fileEditor);

        registerCommands();
        // tslint:disable-next-line: no-unused-expression
        new ImportHandler();
    });

    return createApiProvider([<AzureExtensionApi>{
        revealTreeItem,
        apiVersion: '1.0.0'
    }]);
}

// tslint:disable-next-line:no-empty
export function deactivateInternal(): void {
}
