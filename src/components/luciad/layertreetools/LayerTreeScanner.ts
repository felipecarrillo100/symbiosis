import {LayerTreeNode} from "@luciad/ria/view/LayerTreeNode";
import {PaintRepresentation} from "@luciad/ria/view/PaintRepresentation";
import {LayerTreeNodeType} from "@luciad/ria/view/LayerTreeNodeType";
import {Layer} from "@luciad/ria/view/Layer";
import {FeatureLayer} from "@luciad/ria/view/feature/FeatureLayer";
import {RasterTileSetLayer} from "@luciad/ria/view/tileset/RasterTileSetLayer";
import {WMSTileSetLayer} from "@luciad/ria/view/tileset/WMSTileSetLayer";
import {WMSTileSetModel} from "@luciad/ria/model/tileset/WMSTileSetModel";
import TreeNodeInterface from "../../../interfaces/TreeNodeInterface";
import {EditSelectLayerTools} from "./EditSelectLayerTools";
import {TileSet3DLayer} from "@luciad/ria/view/tileset/TileSet3DLayer";
import {ApplicationCommandsTypes} from "../../../commands/ApplicationCommandsTypes";
import {ApplicationCommands} from "../../../commands/ApplicationCommands";
import {LayerTypes} from "../layertypes/LayerTypes";
import {CreateCommand} from "../../../commands/CreateCommand";
import {LayerConnectCommandsTypes} from "../../../commands/ConnectCommands";

interface GetLayerTreeCommandOptions {
    withModels?: boolean;
    removeCustomsLayers?: boolean;
    removeCredentials?: boolean;
}

enum CustomLayerConstants {
    CrossSectionMeasurementsLayerId
}

class LayerTreeScanner {
    public static getLayerTreeObject(tree:LayerTreeNode) {
        function syncTree(layer: LayerTreeNode, level: number) {
            const newNode:TreeNodeInterface = {} as TreeNodeInterface;
            newNode.realNode = layer;
            newNode.label = layer.label;
            newNode.id = layer.id;
            newNode.title = "";
            newNode.parent_id = undefined;
            if (layer.parent) {
                newNode.parent_id = layer.parent.id;
            }
            // Retrieve Visibility of Layer
            newNode.visible = {value: layer.visible, enabled: true};
            // Retrieve Editability of Layer
            // Retrieve Visibility of Layer labels
            if (layer.isPaintRepresentationSupported(PaintRepresentation.LABEL)) {
                const currentValue = layer.isPaintRepresentationVisible(PaintRepresentation.LABEL);
                newNode.labeled = {value: currentValue, enabled: true};
            } else {
                newNode.labeled = {value: false, enabled: false};
            }
            level++;

            if (layer.treeNodeType === LayerTreeNodeType.LAYER) {
                const l = layer as Layer;
                if (typeof l.editable !== "undefined") {
                    const editable = l.editable && EditSelectLayerTools.isEditable(l);
                    newNode.editable = {value: editable, enabled: EditSelectLayerTools.canEdit(l)};
                }
                else {
                    newNode.editable = {value: false, enabled: false};
                }
                if (l.model && l.model.modelDescriptor && l.model.modelDescriptor.type === "OGC3D") {
                    newNode.treeNodeType = "LAYER_OGC3D";
                }
                if (l.id === 'Grid') {
                    newNode.treeNodeType = "LAYER_GRID";
                }

                const onTop = false;
                const testLayer = l as any;
                if ( testLayer && testLayer.restoreCommand && testLayer.restoreCommand.parameters && testLayer.restoreCommand.parameters.layer && testLayer.restoreCommand.parameters.layer.onTop) {
                    newNode.onTop = { value: !!testLayer.restoreCommand.parameters.layer.onTop, enabled: true };
                }
                if (typeof (l as FeatureLayer).shapeProvider !== 'undefined') {
                    newNode.treeNodeType = "LAYER_FEATURE";
                    // Retrieve Selectability of Layer
                    if (typeof (l as FeatureLayer).selectable !== "undefined"){
                        newNode.selectable = {value: (l as FeatureLayer).selectable, enabled: true};
                    } else {
                        newNode.selectable = {value: false, enabled: false};
                    }
                }
                if (typeof (l as RasterTileSetLayer).rasterStyle !== 'undefined') {
                    newNode.treeNodeType = "LAYER_RASTER";
                    // Retrieve Queryability of Layer (WMS only)

                    if (typeof (l as any).queryable !== "undefined") {
                        if ( l instanceof WMSTileSetLayer) {
                            const wmsLayer =  l as WMSTileSetLayer;
                            const model = wmsLayer.model as WMSTileSetModel;
                            const queryActive = !!(wmsLayer as any).queryActive;
                            newNode.queryable = {value: wmsLayer.queryable, enabled: model.queryable, active: queryActive};
                        } else {
                            newNode.queryable = {value: false, enabled: false, active: undefined};
                        }
                    } else {
                        newNode.queryable = {value: false, enabled: false, active: undefined};
                    }
                }
            } else if (layer.treeNodeType === LayerTreeNodeType.LAYER_GROUP) {
                const group = layer as any;
                newNode.treeNodeType = "LAYER_GROUP";
                newNode.collapsed = typeof group.collapsed !== "undefined" ? group.collapsed : undefined;
                newNode.nodes = [];
                for (const child of layer.children) {
                    const childnode = syncTree(child, level);
                    newNode.nodes.push(childnode)
                }
            }
            return newNode;
        }
        const newTree = syncTree(tree, 0);
        return newTree;
    }

    public static getLayerTreeCommand(tree:LayerTreeNode, options?:GetLayerTreeCommandOptions): LayerConnectCommandsTypes {
        options = options ? options : {} as GetLayerTreeCommandOptions
        const withModels = typeof options.withModels!=="undefined" ? options.withModels : false;
        const removeCredentials = typeof options.removeCredentials!=="undefined" ? options.removeCredentials : false;

        const isExcluded = (layerObject:any) => {
            if (options?.removeCustomsLayers) {
                if (layerObject.layer.id === CustomLayerConstants.CrossSectionMeasurementsLayerId) {
                    return true;
                }
            }
            return false;
        }

        const syncTreeCommand = (layerTreeNode: LayerTreeNode, level: number):any => {
            const layer = layerTreeNode as any;
            let command = layer.restoreCommand as ApplicationCommandsTypes;
            if (typeof command === "undefined") {
                command = CreateCommand({
                    action: ApplicationCommands.CREATELAYER,
                    parameters: {
                        layerType: LayerTypes.Root,
                        layer: {},
                        nodes: [],
                    }
                })
            }
            // tslint:disable-next-line:no-console
            // console.log(command);
            let newNode: any;
            newNode = command;
            if (typeof newNode.parameters.layer === "undefined") {
                newNode.parameters.layer = {};
            }
            newNode.parameters.layer.label = layer.label;
            newNode.parameters.layer.id = layer.id;
            if (layer.parent) {
                newNode.parameters.layer.parent_id = layer.parent.id;
            }
            // Retrieve Visibility of Layer
            newNode.parameters.layer.visible = layer.visible;
            // Retrieve Editability of Layer
            // Retrieve Visibility of Layer labels
            if (layer.isPaintRepresentationSupported(PaintRepresentation.LABEL)) {
                const currentValue = layer.isPaintRepresentationVisible(PaintRepresentation.LABEL);
                newNode.parameters.layer.labeled = currentValue;
            }

            level++;

            if (layer.treeNodeType === LayerTreeNodeType.LAYER) {
                const l = layer as Layer;
                if (withModels) {
                    newNode.parameters.reusableModel = l.model;
                }
                if (removeCredentials && newNode.parameters.model && newNode.parameters.model.requestHeaders) {
                    newNode.parameters.model.requestHeaders = LayerTreeScanner.clearCredentials(newNode.parameters.model.requestHeaders);
                }
                newNode = LayerTreeScanner.getCurrentLayerStateCommand(l, newNode);
            } else if (layer.treeNodeType === LayerTreeNodeType.LAYER_GROUP) {
                newNode.parameters.layer.treeNodeType = "LAYER_GROUP";
                newNode.parameters.layer.collapsed = false; // Collapse not implemented in this version
                newNode.parameters.nodes = [];
                for (const child of layer.children) {
                    const childnode = syncTreeCommand(child, level);
                    if (!isExcluded(childnode)) newNode.parameters.nodes.push(childnode)
                }
            }
            return newNode;
        }
        const newTree = syncTreeCommand(tree, 0);
        return newTree;
    }

    private static clearCredentials(rerequestHeaders: any) {
        const invalidKeys = ["authorization"];
        const newRerequestHeaders = {} as any;
        const keys = Object.keys(rerequestHeaders);
        for (const key of keys) {
            if (!invalidKeys.includes(key.toLowerCase())) {
                newRerequestHeaders[key] = rerequestHeaders[key]
            }
        }
        return newRerequestHeaders;
    }

    public static getCurrentLayerStateCommand(l: Layer, inputNode: any) {
        const newNode = {...inputNode};
        // Retrieve Visibility of Layer
        newNode.parameters.layer.visible = l.visible;
        // Retrieve Editability of Layer
        // Retrieve Visibility of Layer labels
        if (l.isPaintRepresentationSupported(PaintRepresentation.LABEL)) {
            const currentValue = l.isPaintRepresentationVisible(PaintRepresentation.LABEL);
            newNode.parameters.layer.labeled = currentValue;
        }

        if (typeof l.editable !== "undefined") {
            newNode.parameters.layer.editable = l.editable;
        }

        if (l.model && l.model.modelDescriptor && (l.model.modelDescriptor.type === "OGC3D" || l.model.modelDescriptor.type === "HSPC")) {
            newNode.parameters.layer.treeNodeType = "LAYER_OGC3D";
            if (typeof (l as TileSet3DLayer).selectable !== "undefined"){
                newNode.parameters.layer.selectable = (l as TileSet3DLayer).selectable;
            } else {
                newNode.parameters.layer.selectable = false;
            }
            if (typeof (l as TileSet3DLayer).transparency !== "undefined"){
                newNode.parameters.layer.transparency = (l as TileSet3DLayer).transparency;
            } else {
                newNode.parameters.layer.transparency = false;
            }
        }

        if (l.id === 'Grid') {
            newNode.parameters.layer.treeNodeType = "LAYER_GRID";
        }

        if (typeof (l as FeatureLayer).shapeProvider !== 'undefined') {
            newNode.parameters.layer.treeNodeType = "LAYER_FEATURE";
            // Retrieve Selectability of Layer
            if (typeof (l as FeatureLayer).selectable !== "undefined"){
                newNode.parameters.layer.selectable = (l as FeatureLayer).selectable;
            } else {
                newNode.parameters.layer.selectable = undefined;
            }
        }

        if (typeof (l as RasterTileSetLayer).rasterStyle !== 'undefined') {
            newNode.parameters.layer.treeNodeType = "LAYER_RASTER";
            // Retrieve Queryability of Layer (WMS only)

            if (typeof (l as WMSTileSetLayer).queryable !== "undefined") {
                const wmsLayer =  l as WMSTileSetLayer;
                newNode.parameters.layer.queryable = wmsLayer.queryable;
            } else {
                newNode.parameters.layer.queryable = undefined;
            }
        }
        return newNode;
    }

}

export {
    LayerTreeScanner
}
