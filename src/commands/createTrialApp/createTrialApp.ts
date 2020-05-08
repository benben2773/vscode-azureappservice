/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// begins process to create a trial app
// brings up template selector
// returns node to go on tree

import { window } from "vscode";
import { IActionContext, ICreateChildImplContext } from "vscode-azureextensionui";
import { ext } from "../../extensionVariables";

export async function createTrialApp(context: IActionContext & Partial<ICreateChildImplContext>): Promise<void> {

    ext.context.globalState.update('appServiceTrialMode', true);
    window.showInformationMessage('Your NodeJS Trial App has been successfully created.').then(async (result) => {
        if (result) {
            ext.outputChannel.append(result);
        }
    });

    await ext.tree.refresh();
}
