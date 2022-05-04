import {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonInput,
    IonItem,
    IonLabel,
    IonMenuButton,
    IonPage,
    IonTitle,
    IonToolbar
} from '@ionic/react';
import '../../Page.scss';
import {useState} from "react";
import {ApplicationCommands} from "../../../commands/ApplicationCommands";
import {LayerTypes} from "../../../components/luciad/layertypes/LayerTypes";
import {CreateCommand} from "../../../commands/CreateCommand";
import {useDispatch} from "react-redux";
import {SetAppCommand} from "../../../reduxboilerplate/command/actions";
import {useHistory} from "react-router";


const ConnectTMSPage: React.FC = () => {
    const dispatch = useDispatch();
    const history = useHistory();

    const [inputs, setInputs] = useState({
        url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{-y}.png",
        label: "TMS Layer",
        domains: "a,b,c",
        levels: 22,
    });

    const pageTitle = "Connect to TMS";

    const editInput = (event: any) => {
        const {name, value} = event.target;
        const newInputs = {...inputs};
        // @ts-ignore
        newInputs[name] = value;
        setInputs(newInputs);
    }


    const onSubmit = (event: any) => {
        event.preventDefault();
        event.stopPropagation();


        const command = CreateCommand({
            action: ApplicationCommands.CREATELAYER,
            parameters: {
                layerType: LayerTypes.TMSLayer,
                model: {
                    baseURL: inputs.url,
                    subdomains: inputs.domains.split(","),
                    levelCount: inputs.levels
                },
                layer: {
                    label: inputs.label,
                    visible: true,
                },
                autoZoom: true
            }
        });
        dispatch(SetAppCommand(command));
        history.push('/page/Map');
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

            <IonContent fullscreen>
                <IonHeader collapse="condense">
                    <IonToolbar>
                        <IonTitle size="large">{pageTitle}</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <form className="ion-padding" onSubmit={onSubmit}>
                    <IonItem>
                        <IonLabel position="floating">Endpoint URL</IonLabel>
                        <IonInput value={inputs.url} placeholder="Enter a valid url" onIonChange={editInput}
                                  name="url"/>
                    </IonItem>
                    <IonItem>
                        <IonLabel position="floating">Label</IonLabel>
                        <IonInput value={inputs.label} placeholder="Enter name for the layer" onIonChange={editInput}
                                  name="label"/>
                    </IonItem>
                    <IonItem>
                        <IonLabel position="floating">Doimains</IonLabel>
                        <IonInput value={inputs.domains} placeholder="Enter name for the layer" onIonChange={editInput}
                                  name="domains"/>
                    </IonItem>
                    <IonItem>
                        <IonLabel position="floating">Levels</IonLabel>
                        <IonInput type="number" value={inputs.levels} placeholder="Enter name for the layer"
                                  onIonChange={editInput} name="levels"/>
                    </IonItem>

                    <IonButton className="ion-margin-top" type="submit" expand="block">
                        Add layer
                    </IonButton>
                </form>
            </IonContent>
        </IonPage>
    );
};

export {
    ConnectTMSPage
};

