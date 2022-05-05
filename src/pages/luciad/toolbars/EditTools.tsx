import {IonFabButton, IonIcon} from "@ionic/react";
import {analyticsOutline, options, pinOutline, starOutline} from "ionicons/icons";
import {Map} from "@luciad/ria/view/Map";
import {ShapeType} from "@luciad/ria/shape/ShapeType";
import {FeatureLayer} from "@luciad/ria/view/feature/FeatureLayer";
import {DefaultMapController} from "../../../components/luciad/controllers/DefaultMapController";
import {useSelector} from "react-redux";
import {IAppState} from "../../../reduxboilerplate/store";
import {AdvanceLayerTools} from "../../../components/luciad/layerutils/AdvanceLayerTools";
import CreateFeatureInLayerController from "../../../components/luciad/controllers/CreateFeatureInLayerController";
import {Controller} from "@luciad/ria/view/controller/Controller";

interface StateProps {
    map: Map | null;
    currentLayerId: string | null;
}

const EditTools: React.FC = () => {

    const { map, currentLayerId} = useSelector<IAppState, StateProps>((state: IAppState) => {
        return {
            map: state.luciadMap.map,
            currentLayerId: state.luciadMap.currentLayerId
        }
    });

    const addShape = (shapeType: ShapeType) => (event: any) =>{
        if (map) {
            const promiseToLayer = getDrawLayer(map);
            promiseToLayer.then((layer)=>{
                const createController = createShapeController(layer, shapeType);
                if (map) {
                    map.controller = createController;
                }
            }, ()=>{});
        }
    }

    const getCurrentLayer = () => {
        if (map && currentLayerId) {
            return AdvanceLayerTools.getLayerTreeNodeByID(map, currentLayerId);
        } else return null;
    }

    const getDrawLayer = (map: Map) => {
        return new Promise<FeatureLayer>((resolve, reject)=>{
            const layer = getCurrentLayer();
            if (layer !== null && AdvanceLayerTools.isEditable(layer)) {
                resolve(layer as FeatureLayer);
            } else {
              //  const annotationsLayerPromise = this.createAnnotationsLayer(options);
              //  annotationsLayerPromise.then(annotationLayer=>resolve(annotationLayer), reason => reject(reason));
                reject();
            }
        })
    }

    const createShapeController = (layerInput: FeatureLayer, shapeType: ShapeType) => {
        if (map && layerInput) {
            const layer = layerInput as any;
            let defaultProperties = {};
            map.selectObjects([]);
            if (layer.restoreCommand && layer.restoreCommand.properties && layer.restoreCommand.properties.model && layer.restoreCommand.properties.model.defaultProperties){
                defaultProperties = JSON.parse(layer.restoreCommand.properties.model.defaultProperties);
            }
            const createController = new CreateFeatureInLayerController(shapeType, defaultProperties, layer, DefaultMapController.getDefaultMapController() );
            return createController;
        } else {
            return DefaultMapController.getDefaultMapController() ;
        }
    }

    return (
        <>
            <IonFabButton  onClick={addShape(ShapeType.POINT)} ><IonIcon icon={pinOutline} /></IonFabButton>
            <IonFabButton  onClick={addShape(ShapeType.POLYLINE)} ><IonIcon icon={analyticsOutline} /></IonFabButton>
            <IonFabButton  onClick={addShape(ShapeType.POLYGON)} ><IonIcon icon={starOutline} /></IonFabButton>
        </>
    )
}

export {
    EditTools
}