import {observer} from "mobx-react";
import * as React from "react";
import {AnchorButton, Dialog, Intent, Tooltip} from "@blueprintjs/core";
import "./URLConnectDialogComponent.css";
import {AppStore} from "../../../stores/AppStore";

@observer
export class URLConnectDialogComponent extends React.Component<{ appStore: AppStore }, { errMessage: string, url: string }> {
    constructor(props: any) {
        super(props);
        this.state = {errMessage: "", url: ""};
    }

    public render() {
        const appStore = this.props.appStore;
        return (
            <Dialog
                icon={"folder-open"}
                className="url-connect-dialog"
                backdropClassName="minimal-dialog-backdrop"
                canOutsideClickClose={false}
                lazy={true}
                isOpen={appStore.urlConnectDialogVisible}
                onClose={appStore.hideURLConnect}
                title="Connect to URL"
            >
                <div className="bp3-dialog-body">
                    <input className="bp3-input url-connect-input" type="text" placeholder="Remote URL" value={this.state.url} onChange={this.handleInput}/>
                    {this.state.errMessage &&
                    <p>{this.state.errMessage}</p>
                    }
                </div>
                <div className="bp3-dialog-footer">
                    <div className="bp3-dialog-footer-actions">
                        <AnchorButton intent={Intent.NONE} onClick={appStore.hideURLConnect} text="Close"/>
                        <Tooltip content={"Connect to remote server at the given URL"}>
                            <AnchorButton intent={Intent.PRIMARY} onClick={this.onConnectClicked} disabled={!this.validateUrl(this.state.url)} text="Connect"/>
                        </Tooltip>
                    </div>
                </div>
            </Dialog>
        );
    }

    validateUrl = (url) => {
        return url && (url.startsWith("ws://") || url.startsWith("wss://") || url.startsWith("http://") || url.startsWith("https://"));
    };

    handleInput = (ev: React.FormEvent<HTMLInputElement>) => {
        this.setState({url: ev.currentTarget.value});
    };

    onConnectClicked = () => {
        const appStore = this.props.appStore;
        appStore.backendService.connect(this.state.url, "1234").subscribe(sessionId => {
            console.log(`Connected with session ID ${sessionId}`);
            appStore.hideURLConnect();
        }, err => {
            this.setState({errMessage: "Could not connect to remote URL"});
            console.log(err);
        });
    };
}