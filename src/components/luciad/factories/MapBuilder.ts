import {ApplicationCommandsTypes} from "../../../commands/ApplicationCommandsTypes";
import {Map} from "@luciad/ria/view/Map";
import {ApplicationCommands} from "../../../commands/ApplicationCommands";
import {LayerTypes} from "../layertypes/LayerTypes";
import ModelFactory from "./ModelFactory";
import LayerFactory from "./LayerFactory";
import {AdvanceLayerTools} from "../layerutils/AdvanceLayerTools";
import {WMSTileSetLayer} from "@luciad/ria/view/tileset/WMSTileSetLayer";
import {FeatureLayer} from "@luciad/ria/view/feature/FeatureLayer";
import {RasterTileSetLayer} from "@luciad/ria/view/tileset/RasterTileSetLayer";
import {LayerTree} from "@luciad/ria/view/LayerTree";
import {CreatRootLayerCommand, LayerConnectCommandsTypes} from "../../../commands/ConnectCommands";
import {LayerGroup} from "@luciad/ria/view/LayerGroup";
import {Layer} from "@luciad/ria/view/Layer";
import {UrlTileSetModel} from "@luciad/ria/model/tileset/UrlTileSetModel";
import {WMSTileSetModel} from "@luciad/ria/model/tileset/WMSTileSetModel";
import {FeatureModel} from "@luciad/ria/model/feature/FeatureModel";
import {BingMapsTileSetModel} from "@luciad/ria/model/tileset/BingMapsTileSetModel";
import {WMTSTileSetModel} from "@luciad/ria/model/tileset/WMTSTileSetModel";
import {FusionTileSetModel} from "@luciad/ria/model/tileset/FusionTileSetModel";
import {OGC3DTilesModel} from "@luciad/ria/model/tileset/OGC3DTilesModel";
import {TileSet3DLayer} from "@luciad/ria/view/tileset/TileSet3DLayer";

function PromiseToModel<mytype>(model:any) {
    return new Promise<mytype>((resolve)=>resolve(model));
}

class MapBuilder {

    static executeCommand(command: ApplicationCommandsTypes, map: Map) {
        if (map && command){
            const layerTree = map.layerTree;
            switch (command.action) {
                case ApplicationCommands.CREATELAYER:
                    MapBuilder.createAnyLayer(command, map, layerTree);
                    break;
            }
        }
    }

    static createAnyLayer(command: LayerConnectCommandsTypes, map: Map,  target?: LayerTree) {
        return new Promise<Layer | LayerGroup | LayerTree>(resolve => {
            let layerPromise = null;
            switch (command.parameters.layerType) {
                case LayerTypes.WFSLayer:
                    layerPromise = MapBuilder.buildWFSLayer(command);
                    break;
                case LayerTypes.WMSLayer:
                    layerPromise = MapBuilder.buildWMSLayer(command);
                    break;
                case LayerTypes.WMTSLayer:
                    layerPromise = MapBuilder.buildWMTSLayer(command);
                    break;
                case LayerTypes.LTSLayer:
                    layerPromise = MapBuilder.buildLTSLayer(command);
                    break;
                case LayerTypes.TMSLayer:
                    layerPromise = MapBuilder.buildTMSLayer(command);
                    break;
                case LayerTypes.BingMapsLayer:
                    layerPromise = MapBuilder.buildBingMapsLayer(command);
                    break;
                case LayerTypes.OGC3DTilesLayer:
                    layerPromise = MapBuilder.buildOGC3DTilesLayer(command);
                    break;
                case LayerTypes.Root:
                    layerPromise = MapBuilder.buildRoot(command, map);
            }
            layerPromise?.then(layer=> {
                if (command.parameters.layerType === LayerTypes.Root ) {
                    // Do nothing
                } else {
                    if (command.parameters.layerType === LayerTypes.LayerGroup) {
                        if (command.parameters.nodes) { // @ts-ignore
                            delete command.parameters.nodes;
                            const restoreCommand = MapBuilder.clone(command);
                            if (restoreCommand.reusableModel) delete restoreCommand.reusableModel;
                            (layer as any).restoreCommand = restoreCommand;
                            if (restoreCommand.parameters.autoZoom) {
                                restoreCommand.parameters.autoZoom = false;
                                delete restoreCommand.parameters.autoZoom;
                                AdvanceLayerTools.fitToLayer(map, layer);
                            }
                        }
                    } else {
                        const restoreCommand = MapBuilder.clone(command);
                        if (restoreCommand.reusableModel) delete restoreCommand.reusableModel;
                        (layer as any).restoreCommand = restoreCommand;
                        if (restoreCommand.parameters.autoZoom) {
                            restoreCommand.parameters.autoZoom = false;
                            delete restoreCommand.parameters.autoZoom;
                            AdvanceLayerTools.fitToLayer(map, layer);
                        }
                    }
                    if (target) {
                        target.addChild(layer);
                    }
                }
                resolve(layer);
            })
        })
    }


    static buildWFSLayer(command: LayerConnectCommandsTypes) {
        return new Promise<FeatureLayer>((resolve => {
            const modelPromise = command.parameters.reusableModel ? PromiseToModel<FeatureModel>(command.parameters.reusableModel) : ModelFactory.createWFSModel(command.parameters.model);
            modelPromise.then((model)=> {
                delete command.parameters.reusableModel;
                const layerPromise = LayerFactory.createWFSLayer(model, command.parameters.layer);
                layerPromise.then(layer=>{
                    resolve(layer);
                })
            })
        }));
    }

    private static buildWMSLayer(command: LayerConnectCommandsTypes) {
        return new Promise<WMSTileSetLayer>((resolve => {
            const modelPromise = command.parameters.reusableModel ? PromiseToModel<WMSTileSetModel>(command.parameters.reusableModel) : ModelFactory.createWMSModel(command.parameters.model);
            modelPromise.then((model)=>{
                delete command.parameters.reusableModel;
                const layerPromise = LayerFactory.createWMSLayer(model, command.parameters.layer);
                layerPromise.then(layer=>{
                    resolve(layer);
                })
            })
        }))
    }

    private static buildWMTSLayer(command: LayerConnectCommandsTypes) {
        return new Promise<RasterTileSetLayer>((resolve => {
            const modelPromise = command.parameters.reusableModel ? PromiseToModel<WMTSTileSetModel>(command.parameters.reusableModel) : ModelFactory.createWMTSModel(command.parameters.model);
            modelPromise.then((model)=>{
                delete command.parameters.reusableModel;
                const layerPromise = LayerFactory.createWMTSLayer(model, command.parameters.layer);
                layerPromise.then(layer=>{
                    resolve(layer);
                })
            })
        }))
    }

    private static buildLTSLayer(command: LayerConnectCommandsTypes) {
        return new Promise<RasterTileSetLayer>((resolve => {
            const modelPromise = command.parameters.reusableModel ? PromiseToModel<FusionTileSetModel>(command.parameters.reusableModel) : ModelFactory.createLTSModel(command.parameters.model);
            modelPromise.then((model)=>{
                delete command.parameters.reusableModel;
                const layerPromise = LayerFactory.createLTSLayer(model, command.parameters.layer);
                layerPromise.then(layer=>{
                    resolve(layer);
                })
            })
        }))
    }

    private static buildTMSLayer(command: LayerConnectCommandsTypes) {
        return new Promise<RasterTileSetLayer>((resolve => {
            const modelPromise = command.parameters.reusableModel ? PromiseToModel<UrlTileSetModel>(command.parameters.reusableModel) : ModelFactory.createTMSModel(command.parameters.model);
            modelPromise.then((model)=>{
                delete command.parameters.reusableModel;
                const layerPromise = LayerFactory.createTMSLayer(model, command.parameters.layer);
                layerPromise.then(layer=>{
                    resolve(layer);
                })
            })
        }))
    }

    private static buildOGC3DTilesLayer(command: LayerConnectCommandsTypes) {
        return new Promise<TileSet3DLayer>((resolve => {
            const modelPromise = command.parameters.reusableModel ? PromiseToModel<OGC3DTilesModel>(command.parameters.reusableModel) : ModelFactory.createOGC3DTilesModel(command.parameters.model);
            modelPromise.then((model)=>{
                delete command.parameters.reusableModel;
                const layerPromise = LayerFactory.createOGC3DTilesLayer(model, command.parameters.layer);
                layerPromise.then(layer=>{
                    resolve(layer);
                })
            })
        }))
    }

    private static buildBingMapsLayer(command: LayerConnectCommandsTypes) {
        return new Promise<RasterTileSetLayer>((resolve => {
            const modelPromise = command.parameters.reusableModel ? PromiseToModel<BingMapsTileSetModel>(command.parameters.reusableModel) : ModelFactory.createBingMapsModel(command.parameters.model);
            modelPromise.then((model)=>{
                delete command.parameters.reusableModel;
                const layerPromise = LayerFactory.createBingMapsLayer(model, command.parameters.layer);
                layerPromise.then(layer=>{
                    resolve(layer);
                })
            })
        }))
    }

    private static clone(command: ApplicationCommandsTypes) {
        return JSON.parse(JSON.stringify(command));
    }

    private static buildRoot(commandInput: ApplicationCommandsTypes, map: Map) {
        const command = commandInput as CreatRootLayerCommand;
        const layerTree = map.layerTree;
        return new Promise<LayerTree>((resolve => {
            layerTree.removeAllChildren();
            if (layerTree && typeof command.parameters.nodes !== "undefined"){
                const promises = [];
                for (const node of command.parameters.nodes) {
                    promises.push(MapBuilder.createAnyLayer(node, map));
                }
                Promise.all(promises).then(layers=>{
                    for(const layer of layers){
                        layerTree.addChild(layer);
                    }
                    resolve(layerTree);
                }, (status) => {
                    // Just to catch the error 8989
                    if (typeof status !== "undefined"){
                        MapBuilder.logMessage(status);
                    } else {
                        MapBuilder.logError("Failed to create layer");
                    }
                })
            }
            resolve(layerTree)
        }))
    }

    private static logMessage(s: string) {
        // ScreenMessage.showMessage(s)
    }


    private static logError(s: string) {
        // ScreenMessage.error(s);
    }


}

export {
    MapBuilder
}