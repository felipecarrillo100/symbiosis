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
import {ApplicationCommands} from "../../../commands/ApplicationCommands";
import {LayerTypes} from "../../../components/luciad/layertypes/LayerTypes";
import {CreateCommand} from "../../../commands/CreateCommand";
import {useDispatch} from "react-redux";
import {SetAppCommand} from "../../../reduxboilerplate/command/actions";
import {useHistory} from "react-router";
import {LTSCapabilities} from "@luciad/ria/model/capabilities/LTSCapabilities";
import {LTSCapabilitiesCoverage} from "@luciad/ria/model/capabilities/LTSCapabilitiesCoverage";
import {BoundsObject} from "../../../commands/ConnectCommands";


const ConnectLTSPage: React.FC = () => {
    const dispatch = useDispatch();
    const history = useHistory();

    const [inputs, setInputs] = useState({
        url: "https://sampleservices.luciad.com/lts",
        label: "",
        id: "Press Get Layers Button",
    });

    const [layers, setLayers] = useState([] as LTSCapabilitiesCoverage[]);

    const pageTitle = "Connect to LTS";

    const editInput = (event: any) => {
        const {name, value} = event.target;
        const newInputs = {...inputs};

        if (name==="id") {
            const layer = layers.find(l=>l.id === value);
            if (layer) {
                newInputs.id = value;
                newInputs.label = layer.name;
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
        LTSCapabilities.fromURL(request, options).then((result) => {
            if (result.coverages.length>0) {
                const newInputs =  inputs;
                newInputs.id = result.coverages[0].id;
                newInputs.label = result.coverages[0].name;
                setInputs(newInputs);
            }
            setLayers(result.coverages);
        })
    }

    const getLayerBounds = (layer: LTSCapabilitiesCoverage) =>{
        const e: BoundsObject = {
            coordinates:[], reference:""
        }
        const bounds = layer.getBounds();
        if (bounds && bounds.reference) {
            const r : BoundsObject = {
                coordinates: [bounds.x, bounds.width, bounds.y, bounds.height],
                reference: bounds.reference.identifier
            }
            return r;
        }
        return e;
    }

    const onSubmit = (event: any) => {
        event.preventDefault();
        event.stopPropagation();

        const layer = layers.find(l=>l.id === inputs.id);

        if (layer) {
            const command = CreateCommand({
                action: ApplicationCommands.CREATELAYER,
                parameters: {
                    layerType: LayerTypes.LTSLayer,
                    model: {
                        coverageId: layer.id,
                        referenceText: layer.referenceName,
                        boundsObject: getLayerBounds(layer),
                        level0Columns: layer.level0Columns,
                        level0Rows: layer.level0Rows,
                        tileWidth: layer.tileWidth,
                        tileHeight: layer.tileHeight,
                        dataType: layer.type,
                        samplingMode: layer.samplingMode,
                        url: inputs.url
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
    }

    const renderLayers = layers.map((l)=>(
        <IonSelectOption value={l.id} key={l.id}>{l.name}</IonSelectOption>
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
                        <IonSelect value={inputs.id} okText="OK" cancelText="Cancel" onIonChange={editInput} name="id">
                            {renderLayers}
                        </IonSelect>
                    </IonItem>
                    <IonItem>
                        <IonLabel position="floating">Label</IonLabel>
                        <IonInput value={inputs.label} placeholder="Enter name for the layer" onIonChange={editInput} name="label"/>
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
    ConnectLTSPage
};
