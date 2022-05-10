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


const ConnectLocalDatabasePage: React.FC = () => {
    const dispatch = useDispatch();
    const history = useHistory();

    const [inputs, setInputs] = useState({
        label: "Database Raster Layer",
    });

    const pageTitle = "Connect to Database table";

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
                layerType: LayerTypes.DatabaseRasterTileset,
                model: {
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
                        <IonLabel position="floating">Label</IonLabel>
                        <IonInput value={inputs.label} placeholder="Enter name for the layer" onIonChange={editInput}
                                  name="label"/>
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
    ConnectLocalDatabasePage
};

