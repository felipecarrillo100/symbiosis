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
import {WMTSCapabilities} from "@luciad/ria/model/capabilities/WMTSCapabilities";
import {WMTSCapabilitiesLayer} from "@luciad/ria/model/capabilities/WMTSCapabilitiesLayer";
import {WMTSCapabilitiesTileMatrixSet} from "@luciad/ria/model/capabilities/WMTSCapabilitiesTileMatrixSet";


const ConnectWMTSPage: React.FC = () => {
    const dispatch = useDispatch();
    const history = useHistory();

    const [inputs, setInputs] = useState({
        url: "https://sampleservices.luciad.com/wmts",
        label: "",
        layer: "Press Get Layers Button",
        format: "Press Get Layers Button",
        tileMatrixSet: "Press Get Layers Button",
    });

    const [layers, setLayers] = useState([] as WMTSCapabilitiesLayer[]);
    const [tileMatrixSets, setTileMatrixSets] = useState([] as WMTSCapabilitiesTileMatrixSet[])
    const [formats, setFormats] = useState([] as string[])

    const pageTitle = "Connect to WMTS";

    const editInput = (event: any) => {
        const {name, value} = event.target;
        const newInputs = {...inputs};

        if (name==="layer") {
            const layer = layers.find(l=>l.identifier === value);
            if (layer) {
                newInputs.layer = value;
                newInputs.label = layer.title;
                newInputs.format = getPreferredFormat(layer.formats);
                newInputs.tileMatrixSet = getPreferredMatrixSet(layer.tileMatrixSets);
                setInputs(newInputs);
                setTileMatrixSets(layer.tileMatrixSets);
                setFormats(layer.formats);
            }
        } else {
            // @ts-ignore
            newInputs[name] = value;
            setInputs(newInputs);
        }
    }

    const getLayers = () => {
        const request = inputs.url;
        const options = {}
        WMTSCapabilities.fromURL(request, options).then((result) => {
            if (result.layers.length>0) {
                const newInputs =  inputs;
                const layer = result.layers[0];
                newInputs.layer = layer.identifier;
                newInputs.label = layer.title;
                newInputs.format = getPreferredFormat(layer.formats);
                newInputs.tileMatrixSet = getPreferredMatrixSet(layer.tileMatrixSets);
                setInputs(newInputs);
                setTileMatrixSets(layer.tileMatrixSets);
                setFormats(layer.formats);
            }
            setLayers(result.layers);
        })
    }

    const matrixSetBounds = (reference: any) =>{
        const bounds = reference.bounds;
        const coordinates = [bounds.x, bounds.width, bounds.y, bounds.height];
        return {coordinates, reference: reference.identifier};
    }

    const onSubmit = (event: any) => {
        event.preventDefault();
        event.stopPropagation();

        const layer = layers.find(l=>l.identifier === inputs.layer);

        if (layer) {
            const tileMatrixSet = tileMatrixSets.find(l=>l.identifier === inputs.tileMatrixSet);
            let referenceText = "";
            if (tileMatrixSet) {
                referenceText = tileMatrixSet.referenceName;
                const tileMatrices = tileMatrixSet.tileMatrices;
                const tileMatricesIdxList = tileMatrices.map((el) => el.identifier );
                const tileMatricesLimitsList = tileMatrices.map((el) => el.limits );
                const boundsObject = matrixSetBounds(tileMatrixSet.getReference());
                const firstTileMatrix = tileMatrices[0];

                const command = CreateCommand({
                    action: ApplicationCommands.CREATELAYER,
                    parameters: {
                        layerType: LayerTypes.WMTSLayer,
                        model: {
                            url: inputs.url,
                            layer: inputs.layer,
                            tileMatrixSet: inputs.tileMatrixSet,
                            level0Columns: firstTileMatrix.matrixWidth,
                            level0Rows: firstTileMatrix.matrixHeight,
                            referenceText,
                            tileWidth: firstTileMatrix.tileWidth,
                            tileHeight: firstTileMatrix.tileHeight,
                            format: inputs.format,
                            tileMatrices: tileMatricesIdxList,
                            tileMatricesLimits: tileMatricesLimitsList,
                            levelCount: tileMatricesIdxList.length,
                            boundsObject,
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
        <IonSelectOption value={l.identifier} key={l.identifier}>{l.title}</IonSelectOption>
    ));

    const renderFormats = formats.map((f)=>(
        <IonSelectOption value={f} key={f}>{f}</IonSelectOption>
    ));

    const renderTileMatrixSet = tileMatrixSets.map((f)=>(
        <IonSelectOption value={f.identifier} key={f.identifier}>{f.title}</IonSelectOption>
    ));

    const getPreferredFormat = (outputFormats: string[]) => {
        if (outputFormats.find(e=>e==="application/json"))
            return "application/json";
        return outputFormats[0];
    }

    const getPreferredMatrixSet = (items: WMTSCapabilitiesTileMatrixSet[]) => {
        if (items.find(f=>f.identifier==="GoogleMapsCompatible"))
            return "GoogleMapsCompatible";
        return items[0].identifier;
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
                    <IonItem>
                        <IonLabel position="floating">Select TileMatrixSet</IonLabel>
                        <IonSelect value={inputs.tileMatrixSet} okText="OK" cancelText="Cancel" onIonChange={editInput} name="tileMatrixSet">
                            {renderTileMatrixSet}
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
    ConnectWMTSPage
};