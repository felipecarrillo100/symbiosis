const WEB_MERCATOR_MIN_BOUNDS = -20037508.34;
const WEB_MERCATOR_MAX_BOUNDS = 20037508.34;
const WEB_MERCATOR_MIN_LATITUDE = -85.05112877980666;
const WEB_MERCATOR_MAX_LATITUDE = 85.05112877980666;

interface TMPoint {
    x: number,
    y: number
}

interface TMCoordinate {
    lon: number,
    lat: number
}

interface TMBounds {
    p1: TMCoordinate,
    p2: TMCoordinate
}

interface TileManagerOptions {
    url: string;
    subdomains: string[];
}

class TileManager {
    private recommendedZoomDetails: { tileSize: number; z: number; cols: number };
    private bounds: TMBounds;
    private meters1: TMPoint;
    private meters2: TMPoint;
    private maxCount: number;

    constructor(bounds: TMBounds, maxCount: number, options?: TileManagerOptions) {
        this.maxCount = maxCount;
        let lon1t = bounds.p1.lon;
        let lat1t = bounds.p1.lat;

        let lon2t = bounds.p2.lon;
        let lat2t = bounds.p2.lat;

        const lon1 = TileManager.getMin(lon1t, lon2t);
        let lat1 = TileManager.getMin(lat1t, lat2t);

        const lon2 = TileManager.getMax(lon1t, lon2t);
        let lat2 = TileManager.getMax(lat1t, lat2t);

        lat1 = lat1 > WEB_MERCATOR_MIN_LATITUDE ? lat1 : WEB_MERCATOR_MIN_LATITUDE;
        lat2 = lat2 < WEB_MERCATOR_MAX_LATITUDE ? lat2 : WEB_MERCATOR_MAX_LATITUDE;

        // Corrected bounds:
        this.bounds = {
            p1: {lon: lon1, lat: lat1},
            p2: {lon: lon2, lat: lat2}
        };

        this.meters1 = TileManager.degrees2meters(this.bounds.p1.lon, this.bounds.p1.lat);
        this.meters2 = TileManager.degrees2meters(this.bounds.p2.lon, this.bounds.p2.lat);

        const width = this.meters2.x - this.meters1.x;
        const height = this.meters2.y - this.meters1.y;

        const size = TileManager.getMin(width, height);
        this.recommendedZoomDetails = TileManager.recommendZoomLevel(size);
    }

    public getBounds() {
        return this.bounds;
    }

    public getTileRange(levelsRequested: number) {
        const levels =  levelsRequested - 1 ;
        let start = this.maxCount > this.recommendedZoomDetails.z ? this.recommendedZoomDetails.z : this.maxCount;
        if (start>0) --start;
        const end = this.maxCount > this.recommendedZoomDetails.z + levels ? this.recommendedZoomDetails.z+levels : this.maxCount;
        const tileStructure = {
            tileset : {} as any,
            totalTiles : 0,
            minLevel: start,
            maxLevel: end,
            bounds: [this.bounds.p1.lon, this.bounds.p1.lat, this.bounds.p2.lon, this.bounds.p2.lat ]
        }
        for (let i=start; i<=end; ++i) {
            const tileRange = TileManager.getTileRangeInfoForLevel(this.meters1, this.meters2, i);
            tileStructure.tileset[i] = tileRange;
            tileStructure.totalTiles += tileRange.tiles;
        }
        return tileStructure;
    }

    private static getMin(a: number, b: number) {
        if (a<b) return a; else return b;
    }
    private static getMax(a: number, b: number) {
        if (a>b) return a; else return b;
    }

    private static degrees2meters(lon: number, lat: number): TMPoint {
        const x = lon * 20037508.34 / 180;
        const tan = Math.tan((90 + lat) * Math.PI / 360);
        let y = Math.log(tan) / (Math.PI / 180);
        y = y * 20037508.34 / 180;
        return {
            x, y
        }
    }

    private static meters2degrees(x: number, y:number) {
        const lon = x *  180 / 20037508.34 ;
        const lat = Math.atan(Math.exp(y * Math.PI / 20037508.34)) * 360 / Math.PI - 90;
        return {
            lon,
            lat
        }
    }


    private static recommendZoomLevel(size: number) {
        const min = WEB_MERCATOR_MIN_BOUNDS;
        const max = WEB_MERCATOR_MAX_BOUNDS;
        const widthTotal = max - min;

        let width = widthTotal;
        let n=0;
        let cols = 1;

        while(width > size) {
            ++n;
            cols = TileManager.power2(n);
            width = widthTotal / cols;
        }
        return {
            z : n,
            tileSize: width,
            cols : cols
        }
    }

    private static power2(n: number) {
        let x = 1;
        for (let i=0; i<n; ++i){
            x = x * 2;
        }
        return x;
    }

    private static getTileRangeInfoForLevel(point1: TMPoint, point2: TMPoint, level: number) {
        const min = WEB_MERCATOR_MIN_BOUNDS;
        const max = WEB_MERCATOR_MAX_BOUNDS;

        const widthTotal = max - min;

        const cols = TileManager.power2(level);
        const tileSize = widthTotal / cols;

        let minTileX = Math.floor((point1["x"] - min) / tileSize);
        let minTileY = Math.floor((max - point2["y"]) / tileSize);

        minTileX = minTileX < 0 ? 0 : minTileX;
        minTileY = minTileY < 0 ? 0 : minTileY;

        let maxTileX = Math.floor(( point2["x"] - min) / tileSize);
        let maxTileY = Math.floor((max - point1["y"]) / tileSize);

        maxTileX = maxTileX >= cols ? cols-1 : maxTileX;
        maxTileY = maxTileY >= cols ? cols-1 : maxTileY;


        const boundsMeters: [number, number, number, number] = [
            WEB_MERCATOR_MIN_BOUNDS + minTileX*tileSize , WEB_MERCATOR_MAX_BOUNDS - minTileY*tileSize,
            WEB_MERCATOR_MIN_BOUNDS + (maxTileX*tileSize + tileSize) , WEB_MERCATOR_MAX_BOUNDS - (maxTileY * tileSize + tileSize)];
        const bounds = TileManager.convertBoundsMetersToBoundsLonLat(boundsMeters)

        let w = maxTileX - minTileX + 1;
        let h = maxTileY - minTileY + 1;
        return {
            x1 : minTileX,
            y1 : minTileY,
            x2 : maxTileX,
            y2 : maxTileY,
            tiles : w * h,
            bounds
        }
    }

    iterateTiles(level: number, onProcessTile: (level: number, x: number, y: number) => void, onCompleted?:() => void) {
        const result = this.getTileRange(level);
        const keys = Object.keys(result.tileset);
        for (const key of keys) {
            const tileLevel = result.tileset[key];
            for (let x=tileLevel.x1; x<=tileLevel.x2; ++x) {
                for (let y=tileLevel.y1; y<=tileLevel.y2; ++y){
                    const levelZ = Number(key)
                    if (typeof onProcessTile === "function") {
                        onProcessTile(levelZ, x, y);
                    }
                }
            }
        }
        if (typeof onCompleted === "function") onCompleted();
    }

    iterateTilesWithDelay(level: number, delay: number, onProcessTile: (level: number, x: number, y: number) => void, onCompleted?:() => void, onProgress?:(tile: number, total: number)=> void) {
        const datasetResult = this.getTileRange(level);
        const keys = Object.keys(datasetResult.tileset);
        const keyLength = keys.length;
        let keyIndex = 0;
        let tileLevel = datasetResult.tileset[keys[keyIndex]];
        let x = tileLevel.x1;
        let y = tileLevel.y1;
        let counter = 0;
        function iterator() {
            const levelZ = Number(keys[keyIndex]);
            onProcessTile(levelZ, x, y);
            ++y;
            if (y > tileLevel.y2) {
                ++x;
                y = tileLevel.y1;
                if (x > tileLevel.x2) {
                    ++keyIndex;
                    if (keyIndex < keyLength) {
                        tileLevel = datasetResult.tileset[keys[keyIndex]];
                        x = tileLevel.x1;
                        y = tileLevel.y1;
                    }
                }
            }
            if (keyIndex < keyLength) {
                if (typeof onProgress === "function") onProgress(counter++, datasetResult.totalTiles)
                setTimeout(()=>{
                    iterator();
                }, delay);
            } else {
                if (typeof onCompleted === "function") onCompleted();
            }
        }
        iterator();
    }

    private static convertBoundsMetersToBoundsLonLat(boundsMeters: [number, number, number, number]) {
        const x1 = boundsMeters[0];
        const y1 = boundsMeters[1];
        const x2 = boundsMeters[2];
        const y2 = boundsMeters[3];
        const p1 = TileManager.meters2degrees(x1,y1);
        const p2 = TileManager.meters2degrees(x2,y2);
        return [
            p1.lon, p2.lat,
            p2.lon, p1.lat
        ];
    }
}

export {
    TileManager
}