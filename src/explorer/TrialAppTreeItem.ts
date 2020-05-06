/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Disposable } from "vscode";
import { ext } from "vscode-azureappservice/out/src/extensionVariables";
import { AzExtParentTreeItem, IGenericTreeItemOptions } from "vscode-azureextensionui";
import { TrialAppTreeItemBase } from "./TrialAppTreeItemBase";

export class TrialAppTreeItem extends TrialAppTreeItemBase {
    public static contextValue: string = 'trialAppContext';
    public isReadOnly: boolean;
    public readonly effectiveProjectPath: string;
    public readonly preCompiledProjectPath: string | undefined;
    public readonly workspacePath: string;

    private readonly _disposables: Disposable[] = [];

    public constructor(parent: AzExtParentTreeItem, options: IGenericTreeItemOptions) {
        super(parent, options);
    }
    public dispose(): void {
        // tslint:disable-next-line: no-unsafe-any
        Disposable.from(...this._disposables).dispose();
    }

    public hasMoreChildrenImpl(): boolean {
        return false;
    }

    public async deleteTreeItemImpl(): Promise<void> {
        ext.outputChannel.appendLine('Deleting trial app...');
    }
}
