import {
    IonButton,

    IonButtons, IonCol,
    IonContent,
    IonHeader, IonInput, IonItem, IonLabel,

    IonMenuButton,
    IonPage, IonRow,

    IonTitle,
    IonToolbar
} from '@ionic/react';
import '../../Page.scss';
import {useDispatch, useSelector} from "react-redux";
import {IAppState} from "../../../reduxboilerplate/store";
import TreeNodeInterface from "../../../interfaces/TreeNodeInterface";
import {Map} from "@luciad/ria/view/Map";
import {useHistory} from "react-router";
import { useParams } from 'react-router';

import {useRef, useState} from "react";
import {AdvanceLayerTools} from "../../../components/luciad/layerutils/AdvanceLayerTools";
import {TileManager} from "../../../utils/TileManager";

interface StateProps {
    treeNode: TreeNodeInterface | null;
    map: Map | null;
}


const LayerCapturePage: React.FC = () => {
    const history = useHistory();
    const { layerId, x1, y1, x2, y2 } = useParams<{ layerId: string; x1: string; y1: string; x2: string; y2: string}>();

    const pageTitle = "Capture tiles";

    const [inputs, setInputs] = useState({
        tableName: "",
        label: "",
    });

    const tileManager = useRef(null as TileManager | null);

    const { treeNode, map} = useSelector<IAppState, StateProps>((state: IAppState) => {
        return {
            treeNode: state.luciadMap.treeNode,
            map: state.luciadMap.map,
        }
    });

    const onSubmit = (event: any) => {
        event.preventDefault();
        event.stopPropagation();

        if (tileManager.current) {
            let timer = 0
            tileManager.current.iterateTiles(5, (level: number,x: number,y: number) => {
                const f = (t: number) => {
                    setTimeout(()=>{
                        console.log(`x: ${x} y: ${y} z:${level}  t:${t}`);
                    }, t);
                }
                f(timer);
                timer += 4;
            });
        }
        history.push("/page/Map");
    }

    const onCancel = (event: any) => {
        history.push("/page/Map")
    }

    const editInput = (event: any) => {
        const {name, value} = event.target;
        const realValue = (typeof event.detail.checked !== "undefined") ? event.detail.checked : value;

        const newInputs = {...inputs};
        // @ts-ignore
        newInputs[name] = realValue;
        setInputs(newInputs);
    }

    const layer = layerId && map ? AdvanceLayerTools.getLayerTreeNodeByID(map, layerId) as any: null;
    const label = layer ? layer.label : "";
    let url = "";
    let subdomains = [] as string[];

    let levelCount = 22;
    let totalTiles = 0;
    if (layer) {
        levelCount = layer.model.levelCount;
        tileManager.current = new TileManager({p1: {lon:Number(x1),lat:Number(y1)}, p2: {lon:Number(x2),lat:Number(y2)}}, levelCount);
        const result = tileManager.current.getTileRange(22);
        totalTiles = result.totaltiles;

        if (layer.restoreCommand.parameters.layer.label) {
            const tableName = camelize(layer.restoreCommand.parameters.layer.label);
            if (inputs.tableName !== tableName) setInputs({...inputs, tableName})
        }
        if (layer.restoreCommand.parameters.model.baseURL) {
            url = layer.restoreCommand.parameters.model.baseURL;
            subdomains = layer.restoreCommand.parameters.model.subdomains as string[];
        }
        if (layer.restoreCommand.parameters.model.url) {
            const layername = layer.restoreCommand.parameters.model.layer;
            const format = layer.restoreCommand.parameters.model.format;
            url = layer.restoreCommand.parameters.model.url+`?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetTile&LAYER=${layername}&STYLE=default&FORMAT=${format}&TILEMATRIXSET=GoogleMapsCompatible&TILEMATRIX={z}&TILEROW={-y}&TILECOL={x}`;
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
                {/*-- Content here --*/}
                <form onSubmit={onSubmit}>

                    <IonItem>
                        <IonLabel position="floating">Layer name</IonLabel>
                        <IonInput value={label} readonly/>
                    </IonItem>
                    <IonItem>
                        <IonLabel position="floating">URL:</IonLabel>
                        <IonInput value={url} readonly/>
                    </IonItem>
                    <IonItem>
                        <IonLabel position="floating">Levels:</IonLabel>
                        <IonInput value={levelCount} readonly/>
                    </IonItem>
                    <IonItem>
                        <IonLabel position="floating">Subdomains:</IonLabel>
                        <IonInput value={`[${subdomains.join(", ")}]`} readonly/>
                    </IonItem>
                    <IonItem>
                        <IonLabel position="floating">Total tiles</IonLabel>
                        <IonInput value={totalTiles + " (approx. " + (totalTiles * 200 / 1024).toFixed(2) + " MBytes)"} readonly/>
                    </IonItem>
                    <IonItem>
                        <IonLabel position="floating">Table name</IonLabel>
                        <IonInput value={inputs.tableName} onIonChange={editInput} name="tableName"/>
                    </IonItem>
                    <IonRow>
                        <IonCol>
                            <div className="ion-float-end">
                                <IonButtons>
                                    <IonButton type="button" onClick={onCancel}>Cancel</IonButton>
                                    <IonButton type="submit">Submit</IonButton>
                                </IonButtons>
                            </div>
                        </IonCol>
                    </IonRow>
                </form>
            </IonContent>
        </IonPage>
    );
};

function camelize(input: string) {
    const str = input.replace(/[^a-zA-Z ]/g, "");
    return str.replace(/(\w)(\w*)/g,
        function(g0,g1,g2){return g1.toUpperCase() + g2.toLowerCase();}).replace(/\s/g, '');
}

export {
    LayerCapturePage
};
