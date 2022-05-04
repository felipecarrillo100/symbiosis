import {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader, IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonMenuButton,
    IonPage, IonRange,
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
import {sunny} from "ionicons/icons";


const ConnectOGC3DTilesPage: React.FC = () => {
    const dispatch = useDispatch();
    const history = useHistory();

    const [inputs, setInputs] = useState({
        url: "https://sampleservices.luciad.com/ogc/3dtiles/marseille-mesh/tileset.json",
        label: "OGC 3D Tiles",
        qualityFactor: 0.6,
    });

    const pageTitle = "Connect to OGC 3D Tiles";

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
                layerType: LayerTypes.OGC3DTilesLayer,
                model: {
                    url: inputs.url,
                },
                layer: {
                    label: inputs.label,
                    visible: true,
                    qualityFactor: inputs.qualityFactor
                },
                autoZoom: true
            }
        });
        dispatch(SetAppCommand(command));
        history.push('/page/Map');
    }

    const customFormatter = (value: number) => value.toFixed(1);
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
                        <IonLabel position="floating">Quality</IonLabel>
                        <IonRange value={inputs.qualityFactor} min={0} max={2} step={0.1}  pin onIonChange={editInput} name="qualityFactor" pinFormatter={customFormatter}>
                            <IonIcon size="small" slot="start" icon={sunny} />
                            <IonIcon slot="end" icon={sunny} />
                        </IonRange>
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
    ConnectOGC3DTilesPage
};

