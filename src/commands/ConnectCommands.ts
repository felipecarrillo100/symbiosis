import {LayerTypes} from "../components/luciad/layertypes/LayerTypes";
import {ApplicationCommands} from "./ApplicationCommands";
import {Model} from "@luciad/ria/model/Model";
import {WMTSCapabilitiesTileMatrixLimits} from "@luciad/ria/model/capabilities/WMTSCapabilitiesTileMatrixSet";
import {RasterDataType} from "@luciad/ria/model/tileset/RasterDataType";
import {RasterSamplingMode} from "@luciad/ria/model/tileset/RasterSamplingMode";


export interface BoundsObject {
    reference: string;
    coordinates: number[]
}

export enum BingMapsImagerySet  {
    AERIAL="Aerial",
    ROAD="Road",
    HYBRID="AerialWithLabels",
    LIGHT="CanvasLight",
    DARK="CanvasDark",
    GRAY="CanvasGray",
}

export interface CreateLayerBaseCommand {
    action: ApplicationCommands;
    parameters: {
        layerType: LayerTypes;
        reusableModel?: Model;
        model?: {
        };
        layer?: {
            visible?: boolean;
            label?: string;
            id?: string;
            selectable?: boolean;
        },
        autoZoom?: boolean
    }
}

export interface CreateRasterLayerBaseCommand {
    action: ApplicationCommands;
    parameters: {
        layerType: LayerTypes;
        reusableModel?: Model;
        model?: {
            dataType?: RasterDataType;
            samplingMode?: RasterSamplingMode;
        };
        layer?: {
            visible?: boolean;
            label?: string;
            id?: string;
            selectable?: boolean;
        },
        autoZoom?: boolean
    }
}

export  interface CreatRootLayerCommand extends CreateLayerBaseCommand {
    action: ApplicationCommands.CREATELAYER;
    parameters: {
        layerType: LayerTypes.Root;
        reusableModel?: Model;
        model?: {
        };
        layer?: {
        },
        nodes: any[]
        autoZoom?: boolean
    }
}

export  interface CreatLayerGroupCommand extends CreateLayerBaseCommand {
    action: ApplicationCommands.CREATELAYER;
    parameters: {
        layerType: LayerTypes.LayerGroup;
        reusableModel?: Model;
        model?: {
        };
        layer?: {
        },
        nodes: any[]
        autoZoom?: boolean
    }
}


export  interface CreatLayerFeaturesFileCommand extends CreateLayerBaseCommand {
    action: ApplicationCommands.CREATELAYER;
    parameters: {
        layerType: LayerTypes.FeaturesFileLayer;
        reusableModel?: Model;
        model: {
            filename: string;
            filePath: string;
            autoSave?: boolean;
            create?: boolean;
        };
        layer: {
            visible?: boolean;
            label?: string;
            id?: string;
            selectable?: boolean;
        },
        autoZoom?: boolean
    }
}

export  interface CreatLayerWFSCommand extends CreateLayerBaseCommand {
    action: ApplicationCommands.CREATELAYER;
    parameters: {
        layerType: LayerTypes.WFSLayer;
        reusableModel?: Model;
        model: {
            serviceURL: string;
            typeName: string;
            referenceText: string;
        };
        layer: {
            visible?: boolean;
            label?: string;
            id?: string;
            selectable?: boolean;
        },
        autoZoom?: boolean,
        fitBounds?: BoundsObject
    }
}

export interface CreatLayerWMSCommand extends CreateRasterLayerBaseCommand {
    action: ApplicationCommands.CREATELAYER,
    parameters: {
        layerType: LayerTypes.WMSLayer;
        reusableModel?: Model;
        model: {
            getMapRoot: string;
            version?: string;
            referenceText: string;
            layers: string[];
            transparent?: boolean;
            imageFormat?: string;
            dataType?: RasterDataType;
            samplingMode?: RasterSamplingMode;
        };
        layer: {
            visible: boolean;
            label: string;
            id?: string;
        };
        autoZoom?: boolean,
        fitBounds?: BoundsObject
    }
}

export interface CreatLayerWMTSCommand extends CreateRasterLayerBaseCommand {
    action: ApplicationCommands.CREATELAYER,
    parameters: {
        layerType: LayerTypes.WMTSLayer;
        reusableModel?: Model;
        model: {
            url: string;
            referenceText: string;
            layer: string;
            tileMatrixSet: any,
            tileMatrices: string[],
            level0Columns: number;
            level0Rows: number;
            tileMatricesLimits: WMTSCapabilitiesTileMatrixLimits[];
            boundsObject: BoundsObject;
            format: string;
            levelCount: number;
            tileWidth: number;
            tileHeight: number;
            dataType?: RasterDataType;
            samplingMode?: RasterSamplingMode;
        };
        layer: {
            visible: boolean;
            label: string;
            id?: string;
        };
        autoZoom?: boolean
    }
}

export interface CreatLayerLTSCommand extends CreateRasterLayerBaseCommand {
    action: ApplicationCommands.CREATELAYER,
    parameters: {
        layerType: LayerTypes.LTSLayer;
        reusableModel?: Model;
        model: {
            coverageId: string;
            referenceText: string;
            boundsObject: BoundsObject,
            level0Columns: number;
            level0Rows: number;
            tileWidth: number;
            tileHeight: number;
            url: string;
            dataType?: RasterDataType;
            samplingMode?: RasterSamplingMode;
        };
        layer: {
            visible: boolean;
            label: string;
            id?: string;
        };
        autoZoom?: boolean
    }
}

export interface CreatLayerTMSCommand  extends CreateRasterLayerBaseCommand  {
    action: ApplicationCommands.CREATELAYER,
    parameters: {
        layerType: LayerTypes.TMSLayer;
        reusableModel?: Model;
        model: {
            baseURL: string;
            subdomains: string[];
            levelCount: number;
            dataType?: RasterDataType;
            samplingMode?: RasterSamplingMode;
        };
        layer: {
            visible: boolean;
            label: string;
            id?: string;
        };
        autoZoom?: boolean
    }
}

export interface CreatDatabaseRasterTilesetCommand  extends CreateRasterLayerBaseCommand  {
    action: ApplicationCommands.CREATELAYER,
    parameters: {
        layerType: LayerTypes.DatabaseRasterTileset;
        reusableModel?: Model;
        model: {
            tableName: string;
            levelCount: number;
            dataBounds: BoundsObject;
            dataType?: RasterDataType;
            samplingMode?: RasterSamplingMode;
        };
        layer: {
            visible: boolean;
            label: string;
            id?: string;
        };
        autoZoom?: boolean,
        fitBounds: BoundsObject
    }
}

export interface CreatLayerOGC3DTilesCommand  extends CreateLayerBaseCommand  {
    action: ApplicationCommands.CREATELAYER,
    parameters: {
        layerType: LayerTypes.OGC3DTilesLayer;
        reusableModel?: Model;
        model: {
            url: string;
        };
        layer: {
            visible: boolean;
            label: string;
            id?: string;
            qualityFactor: number;
        };
        autoZoom?: boolean
    }
}

export interface CreatLayerBingMapsCommand  extends CreateRasterLayerBaseCommand  {
    action: ApplicationCommands.CREATELAYER,
    parameters: {
        layerType: LayerTypes.BingMapsLayer;
        reusableModel?: Model;
        model: {
            token?: string;
            imagerySet: BingMapsImagerySet;
            dataType?: RasterDataType;
            samplingMode?: RasterSamplingMode;
        };
        layer: {
            visible: boolean;
            label: string;
            id?: string;
        };
        autoZoom?: boolean
    }
}

export type LayerConnectCommandsTypes = CreatLayerWFSCommand | CreatLayerWMSCommand | CreatLayerTMSCommand | CreatRootLayerCommand | CreatLayerGroupCommand |
    CreatLayerBingMapsCommand | CreatLayerWMTSCommand | CreatLayerLTSCommand | CreatLayerOGC3DTilesCommand | CreatLayerFeaturesFileCommand | CreatDatabaseRasterTilesetCommand