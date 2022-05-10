import {RasterTileSetModel, RasterTileSetModelConstructorOptions} from "@luciad/ria/model/tileset/RasterTileSetModel";
import {options} from "ionicons/icons";
import {createBounds} from "@luciad/ria/shape/ShapeFactory";
import {getReference} from "@luciad/ria/reference/ReferenceProvider";
import {Bounds} from "@luciad/ria/shape/Bounds";
import {CoordinateReference} from "@luciad/ria/reference/CoordinateReference";
import {TileCoordinate} from "@luciad/ria/model/tileset/TileCoordinate";
import {RasterDataType} from "@luciad/ria/model/tileset/RasterDataType";
import {RasterSamplingMode} from "@luciad/ria/model/tileset/RasterSamplingMode";


interface ModelOptions {
    tileHeight?: number;
    tileWidth?: number;
    levelCount?: number;
    level0Columns?: number;
    level0Rows?: number;
    dataType?: RasterDataType;
    samplingMode?: RasterSamplingMode;
}

class DatabaseTilesetModel extends RasterTileSetModel {
    constructor(modelOptions: ModelOptions) {
        const REF_WEBMERCATOR = getReference("EPSG:3857");
        const bounds = createBounds(REF_WEBMERCATOR, [-20037508.34278924, 40075016.68557848, -20037508.3520, 40075016.7040]);
        const reference = REF_WEBMERCATOR;
        const options: RasterTileSetModelConstructorOptions = {
            bounds,
            reference,
            tileHeight: modelOptions.tileHeight ? modelOptions.tileHeight : 256,
            tileWidth: modelOptions.tileWidth ? modelOptions.tileWidth : 256,
            levelCount: modelOptions.levelCount ? modelOptions.levelCount : 22,
            level0Columns: modelOptions.level0Columns ? modelOptions.level0Columns : 1,
            level0Rows: modelOptions.level0Rows ? modelOptions.level0Rows : 1,
            dataType: modelOptions.dataType,
            samplingMode: modelOptions.samplingMode,
        }
        super(options);
    }

    getImage(tile: TileCoordinate, onSuccess: (tile: TileCoordinate, image: HTMLImageElement) => void, onError: (tile: TileCoordinate, error?: any) => void, abortSignal: AbortSignal | null): void {
        const canvas = document.createElement("canvas");
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext("2d");
        if (ctx) {
            ctx.beginPath();
            ctx.lineWidth = 6;
            ctx.strokeStyle = "red";
            ctx.rect(10, 10, 256-20, 256-20);
            ctx.stroke();
            ctx.fillStyle = "blue";
            ctx.fillRect(0, 0, 128, 64);

            ctx.fillStyle = "blue";
            ctx.fillRect(256-128, 256-64, 255, 255);

            ctx.font = "16px Arial";

            ctx.textAlign = "center";
            const text = `x=${tile.x} y=${tile.y} level=${tile.level}   `
            ctx.fillText(text,128, 128);
        }

        canvas.toBlob(function(blob) {
            if (blob) {
                const newImg = document.createElement('img');
                const url = URL.createObjectURL(blob);

                newImg.onload = function() {
                    // no longer need to read the blob so it's revoked
                    onSuccess(tile, newImg);
                    URL.revokeObjectURL(url);
                };

                newImg.src = url;
            }
        });
    }
}

export {
    DatabaseTilesetModel
}