/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// begins process to create a trial app
// brings up template selector
// returns node to go on tree

import { QuickPickItem, window } from "vscode";
import { IActionContext, ICreateChildImplContext } from "vscode-azureextensionui";
import { ext } from "../../extensionVariables";
import { localize } from "../../localize";

class TemplateQuickPickItem implements QuickPickItem {
    public label: string;
    public description?: string | undefined;
    public detail?: string | undefined;
    public picked?: boolean | undefined;
    public alwaysShow?: boolean | undefined;
    public trialAppTypeName: string;
}

export async function createTrialApp(context: IActionContext & Partial<ICreateChildImplContext>): Promise<void> {

    const templates: TemplateQuickPickItem[] = [
        { label: 'Express', trialAppTypeName: 'Express' },
        { label: 'ASP.NET Core', trialAppTypeName: 'ASP.NET Core' }
    ];

    const result: TemplateQuickPickItem = <TemplateQuickPickItem>await ext.ui.showQuickPick<TemplateQuickPickItem>(templates, { placeHolder: 'Choose a template for your app.' });

    if (result !== undefined) {
        window.showInformationMessage(`${result.trialAppTypeName} trial app has been successfully created.`, 'Clone source', 'Browse site').then(async (result) => {
            if (result) {
                ext.outputChannel.append(result);
            }
        });

        window.showInformationMessage(localize('finishedCreating', 'Finished creating Trial App.'));

        ext.context.globalState.update('appServiceTrialMode', true);
        await ext.azureAccountTreeItem.refresh();
    }
}
