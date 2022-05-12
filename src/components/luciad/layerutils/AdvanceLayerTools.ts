import {LayerTreeNode} from "@luciad/ria/view/LayerTreeNode";
import {Map} from "@luciad/ria/view/Map";
import {Bounds} from "@luciad/ria/shape/Bounds";
import {FeatureLayer} from "@luciad/ria/view/feature/FeatureLayer";
import {LayerTreeNodeType} from "@luciad/ria/view/LayerTreeNodeType";
import {getReference} from "@luciad/ria/reference/ReferenceProvider";
import {createBounds} from "@luciad/ria/shape/ShapeFactory";
import GeoTools from "../utils/GeoTools";

class AdvanceLayerTools {

    public static layerIDExistsInMap(map: Map, layerID: string) {
        if (map) {
            let node = map.layerTree.findLayerById(layerID) as LayerTreeNode;
            if (typeof node === "undefined") {
                node = map.layerTree.findLayerGroupById(layerID) as LayerTreeNode;
            }
            if (node) {
                return true
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    public static getLayerTreeNodeByID(map: Map, layerID: string): LayerTreeNode | null {
        if (map) {
            let node = map.layerTree.findLayerById(layerID) as LayerTreeNode;
            if (typeof node === "undefined") {
                node = map.layerTree.findLayerGroupById(layerID) as LayerTreeNode;
            }
            return node;
        } else {
            return null;
        }
    }

    public static fitToLayer(map: Map, node: LayerTreeNode) {
        AdvanceLayerTools.getFitBounds(map, node, (fitBounds) => {
            if (fitBounds) {
                setTimeout(()=>{
                   // const crs84Bounds = GeoTools.reprojectBounds(fitBounds, "CRS:84");
                    map.mapNavigator.fit({bounds: fitBounds, animate: true});
                }, 10)
            }
        })
    }

    public static getFitBounds(map: Map, node: LayerTreeNode, callback: (result: Bounds) => void): void {
        function calculateFilteredBounds(layer: FeatureLayer) {
            const boundsArray = layer.workingSet.get()
                .filter(layer.filter as any)
                .map((feature: any) => feature.shape.bounds);
            if (boundsArray.length !== 0) {
                const b = boundsArray.reduce((previousValue: any, currentValue: any) => {
                    previousValue.setTo2DUnion(currentValue);
                    return previousValue;
                }, boundsArray[0].copy());
                return b;
            } else {
                return null;
            }
        }

        if (map) {
            if (node && node.treeNodeType !== LayerTreeNodeType.LAYER_GROUP) {
                if (typeof (node as any).workingSet !== "undefined") {
                    const featureLayer = node as FeatureLayer;
                    const workingSet = featureLayer.workingSet as any;
                    if (featureLayer.filter) {
                        const reducedBounds = calculateFilteredBounds(featureLayer);
                        if (reducedBounds) {
                            callback(reducedBounds);
                        } else {
                            const layer = featureLayer as any;
                            if (workingSet.bounds !== null) {
                                callback(workingSet.bounds);
                            } else {
                                if (layer.restoreCommand && layer.restoreCommand.parameters.fitBounds) {
                                    const ref = getReference(layer.restoreCommand.parameters.fitBounds.reference);
                                    const coordinates = layer.restoreCommand.parameters.fitBounds.coordinates;
                                    callback(createBounds(ref, coordinates));
                                } else {
                                    const expectedBound = featureLayer.bounds;
                                    if (expectedBound) {
                                        callback(expectedBound);
                                    } else {
                                        const qFinishedHandle = featureLayer.workingSet.on("QueryFinished", () => {
                                            if (featureLayer.bounds) {
                                                callback(featureLayer.bounds);
                                            }
                                            qFinishedHandle.remove();
                                        });
                                    }
                                }
                            }
                        }
                    } else {
                        const layer = featureLayer as any;
                        if (workingSet.bounds !== null) {
                            callback(workingSet.bounds);
                        } else {
                            if (layer.restoreCommand && layer.restoreCommand.parameters.fitBounds) {
                                const ref = getReference(layer.restoreCommand.parameters.fitBounds.reference);
                                const coordinates = layer.restoreCommand.parameters.fitBounds.coordinates;
                                const fitBounds = createBounds(ref, coordinates);
                                callback(fitBounds);
                            } else {
                                const expectedBound = featureLayer.bounds;
                                if (expectedBound) {
                                    callback(expectedBound);
                                } else {
                                    const qFinishedHandle = featureLayer.workingSet.on("QueryFinished", () => {
                                        if (featureLayer.bounds) {
                                            callback(featureLayer.bounds);
                                        }
                                        qFinishedHandle.remove();
                                    });
                                }
                            }
                        }
                    }
                } else if (node.visible) {
                    const layer = node as any;
                    if (layer.restoreCommand && layer.restoreCommand.parameters.fitBounds) {
                        const ref = getReference(layer.restoreCommand.parameters.fitBounds.reference);
                        const coordinates = layer.restoreCommand.parameters.fitBounds.coordinates;
                        const fitBounds = createBounds(ref, coordinates);
                        callback(fitBounds);
                    } else {
                        const b = (layer).bounds;
                        callback(b);
                    }
                }
            }
        }
    }

    static isEditable(layerInput: LayerTreeNode) {
        let editable = false;
        const layer = layerInput as any;
        if (layer && typeof layer.editable !== "undefined" && layer.editable) {
            if (this.canEdit(layer)) {
                editable = true
            }
        }
        return editable;
    }

    static canEdit(layer: any) {
        let editable = false;
        if (layer.model.put || layer.model.remove) {
            editable = true
        }
        return editable;
    }
}

export {
    AdvanceLayerTools
}