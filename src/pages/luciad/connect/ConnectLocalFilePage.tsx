import {
    IonButton,
    IonButtons, IonCheckbox,
    IonContent,
    IonHeader,
    IonInput,
    IonItem,
    IonLabel,
    IonMenuButton,
    IonPage,
    IonSelect,
    IonSelectOption,
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
import {BingMapsImagerySet} from "../../../commands/ConnectCommands";

const ConnectLocalFilePage: React.FC = () => {
    const dispatch = useDispatch();
    const history = useHistory();

    const [inputs, setInputs] = useState({
        filename: "noname.json",
        filePath: "Documents",
        autoSave: false
    });

    const pageTitle = "Connect to Local File";

    const editInput = (event: any) => {
        const {name, value} = event.target;
        const realValue = (typeof event.detail.checked !== "undefined") ? event.detail.checked : value;

        const newInputs = {...inputs};
        // @ts-ignore
        newInputs[name] = realValue;
        setInputs(newInputs);
    }


    const onSubmit = (event: any) => {
        event.preventDefault();
        event.stopPropagation();

        const command = CreateCommand({
            action: ApplicationCommands.CREATELAYER,
            parameters: {
                layerType: LayerTypes.FeaturesFileLayer,
                model: {
                    filename: inputs.filename,
                    filePath: inputs.filePath,
                    autoSave: true,
                    create: false
                },
                layer: {
                    label: inputs.filename,
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
                        <IonLabel position="floating">Enter file name</IonLabel>
                        <IonInput value={inputs.filename} placeholder="Enter filename" onIonChange={editInput}
                                  name="filename"/>
                    </IonItem>
                    <IonItem>
                        <IonLabel position="floating">Enter file path</IonLabel>
                        <IonInput value={inputs.filePath} placeholder="Enter filename" onIonChange={editInput}
                                  name="filePath"/>
                    </IonItem>
                    <IonItem>
                        <IonLabel>Autosave</IonLabel>
                        <IonCheckbox checked={inputs.autoSave} onIonChange={editInput} name="autoSave"  />
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
    ConnectLocalFilePage
};

