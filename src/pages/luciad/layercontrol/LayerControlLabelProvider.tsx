import React, {MouseEventHandler} from "react";
import {IonAvatar, IonButton, IonLabel} from "@ionic/react";
import TreeNodeInterface from "../../../interfaces/TreeNodeInterface";
import {RasterTileSetModel} from "@luciad/ria/model/tileset/RasterTileSetModel";
import {RasterDataType} from "@luciad/ria/model/tileset/RasterDataType";


interface Props {
    onCaptureClick?: MouseEventHandler<HTMLIonAvatarElement> | undefined;
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
    let canCapture = false;
    if (props.node.realNode && (props.node.realNode as any).restoreCommand && (props.node.realNode as any).restoreCommand.parameters.layerType === "TMSLayer") {
        canCapture = true;
    }
    if (props.node.realNode && (props.node.realNode as any).restoreCommand && (props.node.realNode as any).restoreCommand.parameters.layerType === "WMTSLayer" &&
        (props.node.realNode as any).restoreCommand.parameters.model.tileMatrixSet === "GoogleMapsCompatible" )
    {
        canCapture = true;
    }
    return (
        <>
            <IonAvatar slot="start" onClick={props.onZoomClick} >
                <img src={icon} style={{borderRadius:0}} alt="LayerType"/>
            </IonAvatar>
            <IonLabel onClick={props.onClick}>
                <h2>{props.node.label}</h2>
                <h3>{info}</h3>
                { canCapture && <IonButton size="small" color="primary" onClick={(e)=>{e.preventDefault();e.stopPropagation(); if (props.onCaptureClick) props.onCaptureClick(e)}}>Capture</IonButton> }
            </IonLabel>
        </>

    )
}

export {
    LayerControlLabelProvider
}