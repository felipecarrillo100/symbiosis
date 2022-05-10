import {IonFabButton, IonIcon} from "@ionic/react";
import {locateOutline} from "ionicons/icons";
import {Map} from "@luciad/ria/view/Map";
import {MapNavigatorFitOptions} from "@luciad/ria/view/MapNavigator";
import {createBounds, createPoint} from "@luciad/ria/shape/ShapeFactory";
import {getReference} from "@luciad/ria/reference/ReferenceProvider";
import { Geolocation } from '@capacitor/geolocation';
import {ScreenMessage} from "../../../screen/ScreenMessage";
import {FeatureLayer} from "@luciad/ria/view/feature/FeatureLayer";
import {AdvanceLayerTools} from "../../../components/luciad/layerutils/AdvanceLayerTools";
import {useSelector} from "react-redux";
import {IAppState} from "../../../reduxboilerplate/store";
import {Feature} from "@luciad/ria/model/feature/Feature";

interface StateProps {
    map: Map | null;
    currentLayerId: string | null;
}

const LocationFabButton: React.FC = () => {

    const { map, currentLayerId} = useSelector<IAppState, StateProps>((state: IAppState) => {
        return {
            map: state.luciadMap.map,
            currentLayerId: state.luciadMap.currentLayerId
        }
    });

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

    const addPoint = (lon: number, lat: number) => {
        if (map) {
            getDrawLayer(map).then((layer)=> {
                if (layer) {
                    const model = layer.model as any;
                    const store = model.store;
                    if (store.put) {
                        const shape =  createPoint(getReference("CRS:84"), [lon, lat])
                        const feature =  new Feature(shape, {name:"You are here"}, 10000 )
                        store.put(feature);
                    }
                }
            })
        }
    }

    const goToLocation = () => {
        if (map) {
            Geolocation.getCurrentPosition().then(result=> {
                const lat = result.coords.latitude;
                const lon = result.coords.longitude;
                const size = 0.00025;
                addPoint(lon, lat)
                ScreenMessage.error(`Lat: ${lat}, Lon: ${lon}`);
                const fitOptions: MapNavigatorFitOptions = {
                    animate: true,
                    bounds: createBounds(getReference("CRS:84"), [lon-size/2, size, lat-size/2, size])
                }
                map?.mapNavigator.fit(fitOptions);
            }).catch((err)=>{
                ScreenMessage.error("Failed to retrieve location")
            })
        }
    }

    return (
        <IonFabButton color="light" onClick={goToLocation}>
            <IonIcon icon={locateOutline} />
        </IonFabButton>

    )

}

export {
    LocationFabButton
}