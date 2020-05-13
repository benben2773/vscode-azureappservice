/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { window } from "vscode";
import { IActionContext, ICreateChildImplContext } from "vscode-azureextensionui";
import { ext } from "../extensionVariables";

export async function createTrialApp(_context: IActionContext & Partial<ICreateChildImplContext>, loginSession?: string): Promise<void> {

    if (loginSession) {
        ext.context.globalState.update('trialApp.hasApp', true);
    } else {
        window.showInputBox({ placeHolder: 'Enter loginsession cookie' }).then((cookie: string) => {
            ext.context.globalState.update('trialApp.loginsession', cookie);
            window.showInformationMessage('Your NodeJS Trial App has been successfully created.');
        });
    }
    await ext.tree.refresh();
}
