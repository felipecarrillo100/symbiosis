import {IonFabButton, IonIcon} from "@ionic/react";
import {locateOutline} from "ionicons/icons";
import {Map} from "@luciad/ria/view/Map";
import {MapNavigatorFitOptions} from "@luciad/ria/view/MapNavigator";
import {createBounds} from "@luciad/ria/shape/ShapeFactory";
import {getReference} from "@luciad/ria/reference/ReferenceProvider";
import { Geolocation } from '@capacitor/geolocation';
import {ScreenMessage} from "../../../screen/ScreenMessage";

interface Props {
    map: Map | null;
}

const LocationFabButton: React.FC<Props> = (props: Props) => {
    const goToLocation = () => {
        if (props.map) {
            Geolocation.getCurrentPosition().then(result=> {
                const lat = result.coords.latitude;
                const lon = result.coords.longitude;
                const size = 0.00000000000001 ;
                const fitOptions: MapNavigatorFitOptions = {
                    animate: true,
                    bounds: createBounds(getReference("CRS:84"), [lon-size/2, size, lat-size/2, size])
                }
                props.map?.mapNavigator.fit(fitOptions);
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