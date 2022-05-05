import {WMSTileSetLayer} from "@luciad/ria/view/tileset/WMSTileSetLayer";
import {LayerConstructorOptions} from "@luciad/ria/view/LayerTreeNode";
import {WMSTileSetModel} from "@luciad/ria/model/tileset/WMSTileSetModel";
import {FeatureModel} from "@luciad/ria/model/feature/FeatureModel";
import {FeatureLayer} from "@luciad/ria/view/feature/FeatureLayer";
import {RasterTileSetLayer} from "@luciad/ria/view/tileset/RasterTileSetLayer";
import {UrlTileSetModel} from "@luciad/ria/model/tileset/UrlTileSetModel";
import {BingMapsTileSetModel} from "@luciad/ria/model/tileset/BingMapsTileSetModel";
import {WMTSTileSetModel} from "@luciad/ria/model/tileset/WMTSTileSetModel";
import {FusionTileSetModel} from "@luciad/ria/model/tileset/FusionTileSetModel";
import {OGC3DTilesModel} from "@luciad/ria/model/tileset/OGC3DTilesModel";
import {HSPCTilesModel} from "@luciad/ria/model/tileset/HSPCTilesModel";
import {LayerType} from "@luciad/ria/view/LayerType";
import {TileSet3DLayer} from "@luciad/ria/view/tileset/TileSet3DLayer";
import ExpressionBuilder from "../expressions/ExpressionBuilder";

class LayerFactory {
    public static createWMSTileSetLayer(model: WMSTileSetModel, options: LayerConstructorOptions) {
        return new WMSTileSetLayer(model, options);
    }

    static createWFSLayer(model: FeatureModel, layerOptions: any) {
        return new Promise<FeatureLayer>((resolve)=>{
            const layer = new FeatureLayer(model, layerOptions);
            resolve(layer);
        })
    }

    static createFeaturesFileLayer(model: FeatureModel, layerOptions: any) {
        return new Promise<FeatureLayer>((resolve)=>{
            const layer = new FeatureLayer(model, layerOptions);
            resolve(layer);
        })
    }

    static createWMSLayer(model: WMSTileSetModel, layerOptions: any) {
        return new Promise<WMSTileSetLayer>((resolve)=>{
            const layer = new WMSTileSetLayer(model, layerOptions)
            resolve(layer);
        })
    }

    static createTMSLayer(model: UrlTileSetModel, layerOptions: any) {
        return new Promise<RasterTileSetLayer>((resolve)=>{
            const layer = new RasterTileSetLayer(model, layerOptions);
            resolve(layer);
        })
    }

    static createBingMapsLayer(model: BingMapsTileSetModel, layerOptions: any) {
        return new Promise<RasterTileSetLayer>((resolve)=>{
            const layer = new RasterTileSetLayer(model, layerOptions);
            resolve(layer);
        })
    }

    static createWMTSLayer(model: WMTSTileSetModel, layerOptions: any) {
        return new Promise<RasterTileSetLayer>((resolve)=>{
            const layer = new RasterTileSetLayer(model, layerOptions);
            resolve(layer);
        })
    }

    static createLTSLayer(model: FusionTileSetModel, layerOptions: any) {
        return new Promise<RasterTileSetLayer>((resolve)=>{
            const layer = new RasterTileSetLayer(model, layerOptions);
            resolve(layer);
        })
    }

    static createOGC3DTilesLayer(model: OGC3DTilesModel | HSPCTilesModel, layerOptions: any) {
        let options = {...layerOptions};

        return new Promise<TileSet3DLayer>((resolve, reject) => {
            if (typeof options === "undefined") {
                options = {}
            }
            options.label = options.label ? options.label : "OGC 3D tiles";
            options.selectable = options.selectable ? options.selectable : true;
            options.transparency = options.transparency ? options.transparency : false;
            options.layerType = options.layerType ? options.layerType : LayerType.STATIC;
            options.qualityFactor = typeof options.qualityFactor !== "undefined" ? options.qualityFactor : 1.0;
            options.offsetTerrain = typeof options.offsetTerrain !== "undefined" ? options.offsetTerrain : true;

            const layer:TileSet3DLayer = new TileSet3DLayer(model, options);

            if (layer) {
                if ((layer as any).restoreCommand) {
                    const layerAny = (layer as any).restoreCommand.parameters.layer;
                    let meshStyle = {
                        pbrSettings: {
                            imageBasedLighting: true,
                            directionalLighting: true,
                            lightIntensity: 0,
                            material: {
                                metallicFactor: 1,
                                roughnessFactor: 1
                            }
                        }
                    }
                    if (layerAny.meshStyle && layerAny.meshStyle.pbrSettings) {
                        meshStyle = layerAny.meshStyle
                    } else {
                        layerAny.meshStyle = meshStyle;
                    }
                    layer.meshStyle.pbrSettings = {
                        imageBasedLighting: meshStyle.pbrSettings.imageBasedLighting,
                        directionalLighting: meshStyle.pbrSettings.directionalLighting,
                        lightIntensity: meshStyle.pbrSettings.lightIntensity,
                        material: meshStyle.pbrSettings.material
                    }
                    LayerFactory.applyVisualProperties(layer, (layer as any).restoreCommand.layer.visualProperties);
                }
                resolve(layer);
            } else {
                reject();
            }
        });
    }

    private static applyVisualProperties(layer: any, visualProperties: any, updateRestoreCommand?: boolean) {
        updateRestoreCommand = typeof updateRestoreCommand !== "undefined" ? updateRestoreCommand : true;

        if (layer && layer.restoreCommand && layer.restoreCommand.layer) {
            if (updateRestoreCommand) {
                layer.restoreCommand.layer.visualProperties = visualProperties;
            }
            layer.currentExpression = {};
            if (visualProperties.type === "PointCloud") {
                if (visualProperties.filterActive && visualProperties.filters.length > 0) {
                    const expression = ExpressionBuilder.visibilityExpression(visualProperties.filters[visualProperties.currentFilter]);
                    layer.pointCloudStyle.visibilityExpression = expression.expression();
                    layer.currentExpression.visibilityExpression = expression;
                }
                if (!visualProperties.filterActive) {
                    layer.pointCloudStyle.visibilityExpression = undefined;
                }
                if (visualProperties.styleActive && visualProperties.styles.length > 0) {
                    const expression = ExpressionBuilder.colorExpression(visualProperties.styles[visualProperties.currentStyle]);
                    layer.pointCloudStyle.colorExpression = expression.expression();
                    layer.currentExpression.colorExpression = expression;
                }
                if (!visualProperties.styleActive) {
                    layer.pointCloudStyle.colorExpression = undefined;
                }
                if (visualProperties.scale) {
                    const expression = ExpressionBuilder.scaleExpression(visualProperties.scale);
                    layer.pointCloudStyle.scaleExpression = expression.expression();
                    layer.currentExpression.scaleExpression = expression;
                }
                if (typeof visualProperties.scalingMode !== "undefined") {
                    const expression = ExpressionBuilder.scalingMode(visualProperties.scalingMode);
                    layer.pointCloudStyle.scalingMode = expression.expression();
                    layer.currentExpression.scalingMode = expression;
                }
            }
        }
    }
}

export default LayerFactory;