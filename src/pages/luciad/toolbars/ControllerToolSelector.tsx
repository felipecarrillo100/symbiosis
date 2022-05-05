
import {IonFabButton, IonIcon} from "@ionic/react";
import {addOutline, analyticsOutline, pinOutline, resizeOutline, scanOutline} from "ionicons/icons";
import {Map} from "@luciad/ria/view/Map";
import RectangleSelectController from "../../../components/luciad/controllers/RectangleSelectController";
import RulerController from "../../../components/luciad/controllers/measurement/ruler2d/RulerController";
import {useEffect, useRef, useState} from "react";
import {DefaultMapController} from "../../../components/luciad/controllers/DefaultMapController";
import {Handle} from "@luciad/ria/util/Evented";

interface Props {
    map: Map | null;
}

const ControllerToolSelector: React.FC<Props> = (props: Props) => {
    const [controllerName, setControllerName ] = useState("");
    const handle = useRef(null as Handle | null);


    useEffect(()=>{
        if (props.map) {
            if (handle.current) {
                handle.current?.remove();
                handle.current = null;
            }
            handle.current = props.map.on('ControllerChanged', controllerHasChanged);
        }
        return ()=> {
            if (handle.current) {
                handle.current?.remove();
                handle.current = null;
            }
        }
    }, [props.map])

    const set2DRuler = () => {
        if (props.map) {
            props.map.controller = new RulerController();
        }
    }

    const setDefaultRuler = () => {
        if (props.map) {
            props.map.controller = DefaultMapController.getDefaultMapController();
        }
    }

    const selectionController = () => {
        if (props.map) {
            props.map.controller = new RectangleSelectController();
        }
    }

    const controllerHasChanged = ()=>{
        let controllerName = "";
        if (props.map && props.map.controller) {
            controllerName = props.map.controller.constructor.name;
        }
        setControllerName(controllerName);
    }

    return (
        <>
            <IonFabButton onClick={setDefaultRuler} color={controllerName==="" ? "primary" : "light" }><IonIcon icon={addOutline}  /></IonFabButton>
            <IonFabButton onClick={selectionController} color={controllerName===RectangleSelectController.name ? "primary" : "light" }><IonIcon icon={scanOutline} /></IonFabButton>
            <IonFabButton onClick={set2DRuler} color={controllerName===RulerController.name ? "primary" : "light" }><IonIcon icon={resizeOutline}  /></IonFabButton>
        </>
    )

}

export {
    ControllerToolSelector
}