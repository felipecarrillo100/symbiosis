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
import {WMSCapabilities, WMSCapabilitiesOperation} from "@luciad/ria/model/capabilities/WMSCapabilities";
import {WMSCapabilitiesLayer} from "@luciad/ria/model/capabilities/WMSCapabilitiesLayer";
import {useHistory} from "react-router";
import {ScreenMessage} from "../../../screen/ScreenMessage";
import {getReference} from "@luciad/ria/reference/ReferenceProvider";
import {createTransformation} from "@luciad/ria/transformation/TransformationFactory";
import {CoordinateReference} from "@luciad/ria/reference/CoordinateReference";


const ConnectWMSPage: React.FC = () => {
    const dispatch = useDispatch();
    const history = useHistory();


    const [inputs, setInputs] = useState({
        url: "https://sampleservices.luciad.com/wms",
        label: "",
        targetLayers: [] as string[],
        format: "",
        projection: ""
    });

    const [layers, setLayers] = useState([] as WMSCapabilitiesLayer[]);
    const [formats, setFormats] = useState([] as string[]);
    const [projections, setProjections] = useState([] as string[]);
    const [version, setVersion] = useState("");

    const pageTitle = "Connect to WMS";

    const createLabel = (selection: string[]) => {
        return selection.map((s)=>{
            const layer = layers.find(l=>l.name === s);
            if (layer) return layer.title; else return "";
        }).join(", ");
    }

    const editInput = (event: any) => {
        const name  = event.target.name;
        const value  = event.detail.value;
        if (value) {
            const newInputs = {...inputs};
            if (name==="targetLayers" ) {
                if (Array.isArray(value)) {
                    newInputs.label = createLabel(value);
                    newInputs.targetLayers = value;
                }
            } else {
                // @ts-ignore
                newInputs[name] = value;
            }
            setInputs(newInputs);
        }
    }

    const getLayers = () => {
        const request = inputs.url;
        const options = {}
        WMSCapabilities.fromURL(request, options).then((result) => {
            const newInputs =  {...inputs};
            let projections: string[] = [];
            const flatLayers = flattenWMSLayers(result.layers);
            if (flatLayers.length>0) {
                newInputs.label = flatLayers[0].title;
                setTimeout(()=>{
                    const cInputs =  {...inputs};
                    cInputs.targetLayers = [ flatLayers[0].name ];
                    cInputs.projection = getPreferredProjection(flatLayers[0].supportedReferences);
                    setInputs(cInputs);
                });

                projections = flatLayers[0].supportedReferences;
            }
            const getMap = GetMap(result.operations);
            const getMapFeatureInfo = GetFeatureInfo(result.operations);
            if (getMap) {
                newInputs.format = getPreferredFormat(getMap.supportedFormats);
                setFormats(getMap.supportedFormats);
            }
            setProjections(projections);
            setInputs(newInputs);
            setLayers(flatLayers);

            setVersion(result.version);
        })
    }

    const onSubmit = (event: any) => {
        event.preventDefault();
        event.stopPropagation();

        if (inputs.targetLayers.length>0) {
            const layer = layers.find(l=>l.name === inputs.targetLayers[0]);
            const selectedLayers = layers.filter((l)=> inputs.targetLayers.findIndex(ll=>ll===l.name) > -1);
            const unionBounds = simplifyBounds(selectedLayers, inputs.projection);
            if (layer) {
                const command = CreateCommand({
                    action: ApplicationCommands.CREATELAYER,
                    parameters: {
                        fitBounds: unionBounds,
                        layerType: LayerTypes.WMSLayer,
                        model: {
                            getMapRoot: inputs.url,
                            layers: inputs.targetLayers,
                            referenceText: inputs.projection,
                            transparent: true,
                            version: version,
                            imageFormat: inputs.format
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
    }

    const renderLayers = layers.map((l)=>(
        <IonSelectOption value={l.name} key={l.name}>{l.title}</IonSelectOption>
    ));

    const renderFormats = formats.map((f)=>(
        <IonSelectOption value={f} key={f}>{f}</IonSelectOption>
    ));

    const renderProjections = projections.map((f)=>(
        <IonSelectOption value={f} key={f}>{f}</IonSelectOption>
    ));

    const getPreferredFormat = (outputFormats: string[]) => {
        if (outputFormats.find(e=>e==="image/png"))
            return "image/png";
        return outputFormats[0];
    }

    const getPreferredProjection = (projections: string[]) => {
        if (projections.find(e => e.toUpperCase() === "EPSG:3857"))
            return "EPSG:3857";
        return projections[0];
    }

    const simplifyBounds = (layers:WMSCapabilitiesLayer[], projection: string) => {
        let resultingBounds;
        try {
            for (const layer of layers) {
                // const bounds = layer.getBounds(ReferenceProvider.getReference("CRS:84"));
                // const bounds = layer.getBounds(ReferenceProvider.getReference("EPSG:4326"));
                const bounds = forceBoundsToCRS84(layer, projection);
                if (typeof resultingBounds === "undefined"){
                    if (bounds) {
                        resultingBounds = bounds.copy();
                    }
                } else {
                    if (bounds) {
                        resultingBounds.setTo2DUnion(bounds);
                    }
                }
            }
            const b = resultingBounds as any;
            return {reference:b.reference.identifier, coordinates:b.coordinates};
        } catch (error) {
            ScreenMessage.error("Missing bounds in references: CRS84 & " + projection);
            throw error;
        }
    }

    const forceBoundsToCRS84 = (layer:WMSCapabilitiesLayer, projection: string) => {
        try {
            const bounds = layer.getBounds(getReference("EPSG:4326"));
            return bounds;
        } catch (err) {
            const boundsNative = layer.getBounds(getReference(projection));
            const WGS84 = getReference("EPSG:4326");
            const toWgs84 = createTransformation(boundsNative.reference as CoordinateReference, WGS84);
            const crs84Bounds = toWgs84.transformBounds(boundsNative);
            return crs84Bounds
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
                        <IonSelect value={inputs.targetLayers} okText="OK" cancelText="Cancel" onIonChange={editInput} name="targetLayers" multiple>
                            {renderLayers}
                        </IonSelect>
                    </IonItem>
                    <IonItem>
                        <IonLabel position="floating">Label</IonLabel>
                        <IonInput value={inputs.label} placeholder="Enter name for the layer" onIonChange={editInput} name="label"/>
                    </IonItem>
                    <IonItem>
                        <IonLabel position="floating">Select Projection</IonLabel>
                        <IonSelect value={inputs.projection} okText="OK" cancelText="Cancel" onIonChange={editInput} name="projection">
                            {renderProjections}
                        </IonSelect>
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

function flattenWMSLayers (layers: WMSCapabilitiesLayer[]): WMSCapabilitiesLayer[]  {
    let result: WMSCapabilitiesLayer[] = [];
    for (const layer of layers) {
        if (layer.name) {
            result.push(layer);
        }
        result = result.concat(layer.children);
    }
    return result;
}

function GetMap(operations: WMSCapabilitiesOperation[]) {
    const getMap = operations.find(operation => operation.name === "GetMap");
    if  (getMap) {
        return {
            supportedFormats: getMap.supportedFormats,
            supportedRequests: (getMap as any).supportedRequests,
        }
    };
    return null;
}

function GetFeatureInfo(operations: WMSCapabilitiesOperation[]) {
    const getMap = operations.find(operation => operation.name === "GetFeatureInfo");
    if  (getMap) {
        return {
            supportedFormats: getMap.supportedFormats,
            supportedRequests: (getMap as any).supportedRequests,
        }
    };
    return null;
}

export {
    ConnectWMSPage
};