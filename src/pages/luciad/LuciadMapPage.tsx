import {
    IonButtons,
    IonContent,
    IonFab, IonFabButton, IonFabList,
    IonHeader,
    IonIcon,
    IonMenuButton,
    IonPage,
    IonTitle,
    IonToolbar
} from '@ionic/react';
import {LuciadMap} from "../../components/luciad/LuciadMap";
import {Map} from "@luciad/ria/view/Map";

import '../Page.scss';
import './LuciadMapPage.scss';
import {useDispatch, useSelector} from "react-redux";
import {IAppState} from "../../reduxboilerplate/store";
import {SetLuciadMap, SetLuciadMapProj, SetLuciadMapTreeNode} from "../../reduxboilerplate/luciadmap/actions";
import TreeNodeInterface from "../../interfaces/TreeNodeInterface";
import {ApplicationCommandsTypes} from "../../commands/ApplicationCommandsTypes";
import {LayerConnectCommandsTypes} from "../../commands/ConnectCommands";
import {CreateCommand} from "../../commands/CreateCommand";
import {SetAppCommand} from "../../reduxboilerplate/command/actions";
import {ApplicationCommands} from "../../commands/ApplicationCommands";
import {FileUtils} from "../../utils/FileUtils";
import {useEffect, useState} from "react";
import {
    addOutline, analyticsOutline,
    arrowBackCircle,
    arrowForwardCircle,
    logoFacebook,
    logoInstagram,
    logoTwitter,
    logoVimeo, pinOutline, scanOutline,
    settings,
    share, squareOutline, starOutline
} from "ionicons/icons";

const defaultFilename = "noname.wsp";
interface StateProps {
    proj: string;
    command: ApplicationCommandsTypes | null;
}

const LuciadMapPage: React.FC = () => {
    const pageTitle = "Map";
    const [workspaceName, setWorkspaceName ] = useState(defaultFilename);

    const dispatch = useDispatch();

    const { proj, command} = useSelector<IAppState, StateProps>((state: IAppState) => {
        return {
            proj: state.luciadMap.proj,
            command: state.appCommand.command,
        }
    });

    const workspaceRestore = (parameters: {proj: string; layerCommand: LayerConnectCommandsTypes; mapState: any}) => {
        restoreMap(parameters);
    }

    const workspaceSave = (parameters: {filename: string}) => {
        setWorkspaceName(parameters.filename);
        const command = CreateCommand({
            action: ApplicationCommands.MAPSAVESTATUS
        });
        dispatch(SetAppCommand(command));
    }

    const workspaceNew = () => {
        setWorkspaceName(defaultFilename);
        const command = CreateCommand({
            action: ApplicationCommands.MAPRESET
        });
        dispatch(SetAppCommand(command));
    }

    useEffect(()=>{
        if (command) {
            switch (command.action) {
                case ApplicationCommands.WORKSPACERESTORE:
                    workspaceRestore(command.parameters);
                    break;
                case ApplicationCommands.WORKSPACESAVE:
                    workspaceSave(command.parameters);
                    break;
                case ApplicationCommands.WORKSPACENEW:
                    workspaceNew();
                    break;
            }
        }
    }, [command] );


    const storeMapToRedux = (map: Map | null) => {
        dispatch(SetLuciadMap(map));
    }

    const storeTreeNodeToRedux = (node: TreeNodeInterface | null) => {
        dispatch(SetLuciadMapTreeNode(node));
    }

    const onSaveMap = (mapStatus: { mapState: any; proj: string; layerCommand: LayerConnectCommandsTypes } | null) => {
        if (mapStatus) {
            console.log(mapStatus);
            FileUtils.download(JSON.stringify(mapStatus), workspaceName, "application/json")
        }
    }
    const restoreMap = (mapStatus: {mapState: any; proj: string; layerCommand: LayerConnectCommandsTypes}) => {
        dispatch(SetLuciadMapProj(mapStatus.proj));
        const command = CreateCommand({
            action: ApplicationCommands.MAPRESTORE,
            parameters: {
                layerCommand: mapStatus.layerCommand,
                mapState: mapStatus.mapState,
            }
        })
        dispatch(SetAppCommand(command));
    }

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonMenuButton/>
                    </IonButtons>
                    <IonTitle>{pageTitle}</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent fullscreen style={{position: "relative"}}>
                <div className={"MapContainer " }>
                    <LuciadMap proj={proj} onMapChange={storeMapToRedux} onLayersChange={storeTreeNodeToRedux} command={command} onSaveMap={onSaveMap}/>
                </div>

                <IonFab vertical="bottom" horizontal="end"  slot="fixed">
                    <IonFabButton>
                        <IonIcon icon={arrowBackCircle} />
                    </IonFabButton>
                    <IonFabList side="top">
                        <IonFabButton><IonIcon icon={addOutline} /></IonFabButton>
                        <IonFabButton><IonIcon icon={scanOutline} /></IonFabButton>
                    </IonFabList>
                    <IonFabList side="start">
                        <IonFabButton><IonIcon icon={pinOutline} /></IonFabButton>
                        <IonFabButton><IonIcon icon={analyticsOutline} /></IonFabButton>
                        <IonFabButton><IonIcon icon={starOutline} /></IonFabButton>
                        <IonFabButton><IonIcon icon={squareOutline} /></IonFabButton>
                    </IonFabList>
                </IonFab>
            </IonContent>
        </IonPage>
    );
};

export {
    LuciadMapPage
};
