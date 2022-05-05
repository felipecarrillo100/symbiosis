

import {IonFabButton, IonIcon} from "@ionic/react";
import {analyticsOutline, locateOutline, pinOutline, starOutline} from "ionicons/icons";
import {Map} from "@luciad/ria/view/Map";
import {MapNavigatorFitOptions} from "@luciad/ria/view/MapNavigator";
import {createBounds} from "@luciad/ria/shape/ShapeFactory";
import {getReference} from "@luciad/ria/reference/ReferenceProvider";

interface Props {
    map: Map | null;
}

const LocationFabButton: React.FC<Props> = (props: Props) => {
    const goToLocation = () => {
        if (props.map) {
            const lat = 50.865;
            const lon = 4.6690;
            const size = 0.00000000000001 ;
            const fitOptions: MapNavigatorFitOptions = {
                animate: true,
                bounds: createBounds(getReference("CRS:84"), [lon-size/2, size, lat-size/2, size])
            }
            props.map.mapNavigator.fit(fitOptions);
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