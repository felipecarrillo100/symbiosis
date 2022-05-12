import {
    IonButton,
    IonButtons,
    IonCol,
    IonContent,
    IonHeader,
    IonInput,
    IonItem,
    IonLabel,
    IonMenuButton,
    IonPage,
    IonRow,
    IonSelect,
    IonSelectOption,
    IonTitle,
    IonToolbar
} from '@ionic/react';
import '../../Page.scss';
import {useState} from "react";
import {WFSCapabilities} from "@luciad/ria/model/capabilities/WFSCapabilities";
import {WFSCapabilitiesFeatureType} from "@luciad/ria/model/capabilities/WFSCapabilitiesFeatureType";
import {ApplicationCommands} from "../../../commands/ApplicationCommands";
import {LayerTypes} from "../../../components/luciad/layertypes/LayerTypes";
import {CreateCommand} from "../../../commands/CreateCommand";
import {useDispatch} from "react-redux";
import {SetAppCommand} from "../../../reduxboilerplate/command/actions";
import {useHistory} from "react-router";
import {getReference} from "@luciad/ria/reference/ReferenceProvider";
import {BoundsObject} from "../../../commands/ConnectCommands";


const ConnectWFSPage: React.FC = () => {
    const dispatch = useDispatch();
    const history = useHistory();

    const [inputs, setInputs] = useState({
        url: "https://sampleservices.luciad.com/wfs",
        label: "",
        layer: "Press Get Layers Button",
        format: "Press Get Layers Button",
    });

    const [layers, setLayers] = useState([] as WFSCapabilitiesFeatureType[]);
    const [formats, setFormats] = useState([] as string[])

    const pageTitle = "Connect to WFS";

    const editInput = (event: any) => {
        const {name, value} = event.target;
        const newInputs = {...inputs};

        if (name==="layer") {
            const layer = layers.find(l=>l.name === value);
            if (layer) {
                newInputs.layer = value;
                newInputs.label = layer.title;
                newInputs.format = getPreferredFormat(layer.outputFormats);
                setFormats(layer.outputFormats);
            }
        } else {
            // @ts-ignore
            newInputs[name] = value;
        }
        setInputs(newInputs);
    }

    const getLayers = () => {
        const request = inputs.url;
        const options = {}
        WFSCapabilities.fromURL(request, options).then((result) => {
            if (result.featureTypes.length>0) {
                const newInputs =  inputs;
                newInputs.layer = result.featureTypes[0].name;
                newInputs.label = result.featureTypes[0].title;
                newInputs.format = getPreferredFormat(result.featureTypes[0].outputFormats);
                setInputs(newInputs);
                setFormats(result.featureTypes[0].outputFormats);
            }
            setLayers(result.featureTypes);
        })
    }

    const onSubmit = (event: any) => {
        event.preventDefault();
        event.stopPropagation();

        const layer = layers.find(l=>l.name === inputs.layer);

        if (layer) {
            const nBounds = normalizeBounds(layer)
            const referenceText = layer.defaultReference;
            const command = CreateCommand({
                action: ApplicationCommands.CREATELAYER,
                parameters: {
                    layerType: LayerTypes.WFSLayer,
                    model: {
                        serviceURL: inputs.url,
                        typeName: inputs.layer,
                        referenceText
                    },
                    layer: {
                        label: inputs.label,
                        visible: true,
                        selectable: true
                    },
                    autoZoom: true,
                    fitBounds: nBounds
                }
            });
            dispatch(SetAppCommand(command));
            history.push('/page/Map');
        }
    }

    const renderLayers = layers.map((l)=>(
        <IonSelectOption value={l.name} key={l.name}>{l.title}</IonSelectOption>
    ));

    const renderFormats = formats.map((f)=>(
        <IonSelectOption value={f} key={f}>{f}</IonSelectOption>
    ));

    const getPreferredFormat = (outputFormats: string[]) => {
        if (outputFormats.find(e=>e==="application/json"))
            return "application/json";
        return outputFormats[0];
    }

    const normalizeBounds = (layer:WFSCapabilitiesFeatureType) => {
        const boundsArray = layer.getWGS84Bounds();
        if (boundsArray.length>0) {
            const bounds = boundsArray[0];
            const b = [bounds.x, bounds.width, bounds.y, bounds.height];
            // @ts-ignore
            return {coordinates: b, reference:bounds.reference.identifier};
        } else {
            const b = [-180, 360, -90, 180];
            return {coordinates: b, reference:"CRS:84"};
        }
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
                    <IonRow>
                        <IonCol>
                            <div className="ion-float-end">
                                <IonButton type="button" size="small" fill="solid" color="primary" expand="block"
                                           onClick={getLayers}>
                                    Get layers
                                </IonButton>
                            </div>
                        </IonCol>
                    </IonRow>
                    <IonItem>
                        <IonLabel position="floating">Select Layer</IonLabel>
                        <IonSelect value={inputs.layer} okText="OK" cancelText="Cancel" onIonChange={editInput} name="layer">
                            {renderLayers}
                        </IonSelect>
                    </IonItem>
                    <IonItem>
                        <IonLabel position="floating">Label</IonLabel>
                        <IonInput value={inputs.label} placeholder="Enter name for the layer" onIonChange={editInput} name="label"/>
                    </IonItem>
                    <IonItem>
                        <IonLabel position="floating">Select Format</IonLabel>
                        <IonSelect value={inputs.format} okText="OK" cancelText="Cancel" onIonChange={editInput} name="format">
                            {renderFormats}
                        </IonSelect>
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
    ConnectWFSPage
};