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


const ConnectBingMapsPage: React.FC = () => {
    const dispatch = useDispatch();
    const history = useHistory();

    const [inputs, setInputs] = useState({
        token: "AugjqbGwtwHP0n0fUtpZqptdgkixBt5NXpfSzxb7q-6ATmbk-Vs4QnqiW6fhaV-i",
        label: "Satellite",
        layer: BingMapsImagerySet.AERIAL as BingMapsImagerySet,
    });

    const [bingmapSet] = useState([
        {
            value: BingMapsImagerySet.AERIAL,
            title: "BingMaps Satellite"
        }, {
            value: BingMapsImagerySet.HYBRID,
            title: "BingMaps Hybrid"
        }, {
            value: BingMapsImagerySet.ROAD,
            title: "BingMaps Streets"
        }]);

    const pageTitle = "Connect to Bingmaps";

    const editInput = (event: any) => {
        const {name, value} = event.target;
        const newInputs = {...inputs};
        // @ts-ignore
        newInputs[name] = value;
        if (name==="layer") {
            const dataSet = bingmapSet.find(e=>e.value===value);
            if (dataSet) newInputs.label = dataSet.title
        }
        setInputs(newInputs);
    }


    const onSubmit = (event: any) => {
        event.preventDefault();
        event.stopPropagation();

        const command = CreateCommand({
            action: ApplicationCommands.CREATELAYER,
            parameters: {
                layerType: LayerTypes.BingMapsLayer,
                model: {
                    token: inputs.token,
                    imagerySet: inputs.layer,
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


    const renderLayers =  bingmapSet.map((f)=>(
        <IonSelectOption value={f.value} key={f.value}>{f.title}</IonSelectOption>
    ));


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
                        <IonInput value={inputs.token} placeholder="Enter a valid url" onIonChange={editInput}
                                  name="token"/>
                    </IonItem>
                    <IonItem>
                        <IonLabel position="floating">Select Format</IonLabel>
                        <IonSelect value={inputs.layer} okText="OK" cancelText="Cancel" onIonChange={editInput} name="layer">
                            {renderLayers}
                        </IonSelect>
                    </IonItem>
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
    ConnectBingMapsPage
};

