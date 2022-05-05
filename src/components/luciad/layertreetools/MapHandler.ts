import {Map} from "@luciad/ria/view/Map";
import {Handle} from "@luciad/ria/util/Evented";
import {LayerTreeNode} from "@luciad/ria/view/LayerTreeNode";
import {EventedSupport} from "@luciad/ria/util/EventedSupport";
import {PaintRepresentation} from "@luciad/ria/view/PaintRepresentation";
import {FeatureLayer} from "@luciad/ria/view/feature/FeatureLayer";
import {LayerTreeVisitor} from "@luciad/ria/view/LayerTreeVisitor";
import {LayerTreeScanner} from "./LayerTreeScanner";
import TreeNodeInterface from "../../../interfaces/TreeNodeInterface";
import * as stream from "stream";
import {AdvanceLayerTools} from "../layerutils/AdvanceLayerTools";


interface LayerTreeListeners  {
    NodeAdded: null | Handle;
    NodeMoved: null | Handle;
    NodeRemoved: null | Handle;
}

interface LayerListeners {
    PaintRepresentationVisibilityChanged: Handle | null;
    visibilityChange: Handle | null;
    triggerNodeUpdate: Handle | null;
}

const InitialLayerTreeListenerValues: LayerTreeListeners = {
    NodeAdded: null,
    NodeMoved: null,
    NodeRemoved: null
}

interface LayerTreeNodeChange { index: number; node: LayerTreeNode; path: LayerTreeNode[] }


class MapHandler {
    private map: Map | null;
    private currentLayer : string | null;
    private layerTreeListeners: LayerTreeListeners = InitialLayerTreeListenerValues;
    public onLayerTreeChange: ((layes: TreeNodeInterface) => void) | null = null;
    public onCurrentLayerChange: ((layerId: (string | null)) => void) | null = null;

    constructor(map:Map) {
        this.map = map;
        this.currentLayer = null;
        this.attachListeners();
    }

    private attachListeners() {
        this.addLayerTreeListeners();
    }

    private addLayerTreeListeners() {
        if (this.map) {
            this.layerTreeListeners.NodeAdded =  this.map.layerTree.on('NodeAdded', this.addNewLayerListener);
            this.layerTreeListeners.NodeMoved = this.map.layerTree.on('NodeMoved', this.layerMovedListener);
            this.layerTreeListeners.NodeRemoved = this.map.layerTree.on('NodeRemoved', this.layerRemovedListener);
        }
    }

    private removeLayerTreeListeners() {
        this.layerTreeListeners.NodeAdded?.remove();
        this.layerTreeListeners.NodeMoved?.remove();
        this.layerTreeListeners.NodeRemoved?.remove();
        this.initLayerTreeListeners();
    }

    private initLayerTreeListeners() {
        this.layerTreeListeners = {
            NodeAdded: null,
            NodeMoved: null,
            NodeRemoved: null
        }
    }

    private addNewLayerListener = (layerObject: LayerTreeNodeChange) => {
        const layer = layerObject.node as any;
        this.setCurrentLayer(layer.id);

        layer.layerListeners = {
            PaintRepresentationVisibilityChanged: null,
            visibilityChange: null,
            triggerNodeUpdate: null,
        } as LayerListeners;
        const setVisibilityListener = (node: LayerTreeNode) => {
            const visibilityChange = (/*visible: boolean*/) => {
                this.triggerLayerChange();
            };
            (node as any).layerListeners.visibilityChange =  node.on("VisibilityChanged", visibilityChange);
        }
        const setTriggerRenderListener = (node: LayerTreeNode) => {
            const triggerChange = (/*visible: boolean*/) => {
                this.triggerLayerChange();
            };
            if (typeof (node as any)._eventSupport ===  "undefined") {
                (node as any)._eventSupport = new EventedSupport(["TriggerNodeUpdate"], true);
                // console.log("EventHandler added: " + node.id);
            }
            if ((node as any)._eventSupport) {
                // console.log("Listener added: " + node.id + ": " + node.label);
                (node as any).layerListeners.triggerNodeUpdate =  (node as any)._eventSupport.on("TriggerNodeUpdate", triggerChange);
            }
        }
        const setLabelVisibilityListener = (node: LayerTreeNode) => {
            const visibilityChange = (value: boolean, paintRepresentation: PaintRepresentation) => {
                if (paintRepresentation === PaintRepresentation.LABEL) {
                    this.triggerLayerChange();
                }
            };
            (node as any).layerListeners.PaintRepresentationVisibilityChanged = node.on("PaintRepresentationVisibilityChanged", visibilityChange);
        }
        if (layer.restoreCommand && layer.restoreCommand.parameters && layer.restoreCommand.parameters.maxFeatures) {
            const setQueryListener = (featuerLayer: FeatureLayer) => {
                const QueryFinished = featuerLayer.workingSet.on("QueryFinished", () => {
                    const length = featuerLayer.workingSet.get().length;
                    if (length>=(featuerLayer as any).restoreCommand.parameters.layer.maxFeatures) {
                        this.logInfo("WFS Layer " + featuerLayer.label  + " maxFeatures exceeds " + (featuerLayer as any).restoreCommand.layer.maxFeatures)
                    }
                    QueryFinished.remove();
                });
            }
        }
        setVisibilityListener(layer);
        setLabelVisibilityListener(layer);
        setTriggerRenderListener(layer);
        this.triggerLayerChange();
    }

    private layerMovedListener = () => {
        this.triggerLayerChange();
    }

    public setCurrentLayer(value: string | null) {
        let newValue = null;
        if (this.map && value && AdvanceLayerTools.layerIDExistsInMap(this.map, value)) {
           newValue = value;
        }
        this.currentLayer = newValue;
        if (typeof this.onCurrentLayerChange === "function") {
            this.onCurrentLayerChange(this.currentLayer);
        }
    }

    private layerRemovedListener = (layerObject: LayerTreeNodeChange) => {
        // console.log("Remove: " + layerObject.node.label + " " + layerObject.node.id);

        if (this.map &&this.currentLayer === layerObject.node.id && this.map.layerTree.children && this.map.layerTree.children.length>0 && this.map.layerTree.children[0].id !== layerObject.node.id) {
            this.setCurrentLayer(this.map.layerTree.children[this.map.layerTree.children.length-1].id);
        } else {
            this.setCurrentLayer(null);
        }

        const layer = layerObject.node as any;
        const model = layer.model;
        if (this.isDestroyableModel(model)) {
            this.WhenIsParentLessModel(model).then((parentLessModel)=>{
                this.destroyModel(parentLessModel);
            });
        }
        if (layer.layerListeners) {
            // console.log("Listeners removed: " + layer.id + ": " + layer.label);
            if (layer.layerListeners.visibilityChange) layer.layerListeners.visibilityChange.remove();
            if (layer.layerListeners.PaintRepresentationVisibilityChanged) layer.layerListeners.PaintRepresentationVisibilityChanged.remove();
            if (layer.layerListeners.triggerNodeUpdate) layer.layerListeners.triggerNodeUpdate.remove();
            layer._eventSupport = undefined;
            layer.layerListeners = undefined;
        }
        this.triggerLayerChange();
    }

    private triggerLayerChange() {
        if (this.map) {
            const layerTree = this.map.layerTree;
            const retrievedLayers = LayerTreeScanner.getLayerTreeObject(layerTree);
            // console.log(retrievedLayers);
            if (typeof this.onLayerTreeChange === "function") {
                this.onLayerTreeChange(retrievedLayers);
            }
        }
    }

    private destroy() {
        this.removeLayerTreeListeners()
        if (this.map) this.map.destroy();
        this.map = null;
    }

    /*********** Destroyable mdoels ******/
    /************* Layer with destroyable models to be handled specially ****************/
    private isDestroyableModel(model: any) {
        if (model && typeof model.destroy === "function") {
            return true
        } else {
            return false;
        }
    }

    private destroyModel(model: any) {
        if (model && typeof model.destroy === "function") {
            model.destroy();
        } else {
            return false;
        }
    }

    private WhenIsParentLessModel(model: any) {
        return new Promise((resolve)=>{
            setTimeout(()=>{
                if (this.isParentLessModel(model)) {
                    resolve(model);
                }
            }, 1000);
        })
    }

    private isParentLessModel(model: any) {
        let parentless = true;
        const layerTreeVisitor = {
            visitLayer: (layer: any) => {
                if (layer.model && layer.model === model) {
                    parentless = false;
                }
                return LayerTreeVisitor.ReturnValue.CONTINUE;
            },
            visitLayerGroup: (layerGroup: any) => {
                layerGroup.visitChildren(layerTreeVisitor, LayerTreeNode.VisitOrder.TOP_DOWN);
                return LayerTreeVisitor.ReturnValue.CONTINUE;
            }
        };
        this.map?.layerTree.visitChildren(layerTreeVisitor, LayerTreeNode.VisitOrder.TOP_DOWN);
        return parentless;
    }

    private logInfo(s: string) {
        // ScreenMessage.warning(s);
    }

    public triggerRefresh() {
        this.triggerLayerChange();
    }
}

export {
    MapHandler
}