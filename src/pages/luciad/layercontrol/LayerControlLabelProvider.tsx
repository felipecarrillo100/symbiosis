import React, {MouseEventHandler} from "react";
import {IonAvatar, IonLabel} from "@ionic/react";
import TreeNodeInterface from "../../../interfaces/TreeNodeInterface";
import {RasterTileSetModel} from "@luciad/ria/model/tileset/RasterTileSetModel";
import {RasterDataType} from "@luciad/ria/model/tileset/RasterDataType";


interface Props {
    onZoomClick?: MouseEventHandler<HTMLIonAvatarElement> | undefined;
    onClick?: MouseEventHandler<HTMLIonAvatarElement> | undefined;
    node: TreeNodeInterface;
}

const LayerControlLabelProvider: React.FC<Props> = (props: Props) => {
    let info = "";
    let icon = "/assets/avatars/satellite.jpg";
    if (props.node.treeNodeType === "LAYER_FEATURE") {
        info = "Features";
        icon = "/assets/avatars/vector.jpg"
    } else if (props.node.treeNodeType === "LAYER_RASTER") {
        info = "Raster"
        const model = (props.node.realNode as any).model as RasterTileSetModel;
        if (model && model.dataType === RasterDataType.ELEVATION) {
            info = "Raster/Elevation";
            icon = "/assets/avatars/elevation.png"
        }
    } else if (props.node.treeNodeType === "LAYER_OGC3D") {
        info = "Tileset 3D";
        icon = "/assets/avatars/skyline.jpg"
    }
    console.log("node: ",props.node);
    console.log("layer: ", props.node.realNode);
    return (
        <>
            <IonAvatar slot="start" onClick={props.onZoomClick} >
                <img src={icon} style={{borderRadius:0}} alt="LayerType"/>
            </IonAvatar>
            <IonLabel onClick={props.onClick}>
                <h2>{props.node.label}</h2>
                <h3>{info}</h3>
                <p>Unknown source</p>
            </IonLabel>
        </>

    )
}

export {
    LayerControlLabelProvider
}