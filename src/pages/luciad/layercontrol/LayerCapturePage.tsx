import {
    IonButton,

    IonButtons, IonCol,
    IonContent,
    IonHeader, IonInput, IonItem, IonLabel,

    IonMenuButton,
    IonPage, IonRow,

    IonTitle,
    IonToolbar
} from '@ionic/react';
import '../../Page.scss';
import {useDispatch, useSelector} from "react-redux";
import {IAppState} from "../../../reduxboilerplate/store";
import TreeNodeInterface from "../../../interfaces/TreeNodeInterface";
import {Map} from "@luciad/ria/view/Map";
import {useHistory} from "react-router";
import { useParams } from 'react-router';

import {useRef, useState} from "react";
import {AdvanceLayerTools} from "../../../components/luciad/layerutils/AdvanceLayerTools";
import {TileManager} from "../../../utils/TileManager";
import {DataBaseManager} from "../../../utils/DataBaseManager";
import {DBSQLiteValues, SQLiteDBConnection} from "@capacitor-community/sqlite";
import {ScreenMessage} from "../../../screen/ScreenMessage";

interface StateProps {
    map: Map | null;
    databaseManager: DataBaseManager | null;
}

interface RaterTableEntry {
    name: string;
    title:string;
    description: string;
    size: number;
    minLevel: number;
    maxLevel: number;
    dataType: string;
    samplingMode: string;
    bounds: number[];
}


const LayerCapturePage: React.FC = () => {
    const history = useHistory();
    const { layerId, x1, y1, x2, y2 } = useParams<{ layerId: string; x1: string; y1: string; x2: string; y2: string}>();

    const pageTitle = "Capture tiles";

    const [inputs, setInputs] = useState({
        tableName: "",
        label: "",
        targetZoomLevels: 5,
    });
    const domainIndex = useRef(0);

    const tileManager = useRef(null as TileManager | null);

    const { databaseManager, map } = useSelector<IAppState, StateProps>((state: IAppState) => {
        return {
            treeNode: state.luciadMap.treeNode,
            map: state.luciadMap.map,
            databaseManager: state.database.databaseManager,
        }
    });


    const createTable = (db: SQLiteDBConnection | null, tableEntry: RaterTableEntry) =>{
        return new Promise<string | null>(resolve => {
            const table = camelize(tableEntry.name);
            const tileSetsTableName = "rasters"
            if (db) {
                const sqlDropIndexTable = `DROP TABLE IF EXISTS ${tileSetsTableName}`;
                const sqlCreateIndexTable = `CREATE TABLE IF NOT EXISTS ${tileSetsTableName}
    ( 
        name TEXT PRIMARY KEY NOT NULL,
        title TEXT,
        description TEXT,
        size INTEGER,
        minLevel INTEGER,
        maxLevel INTEGER,
        dataType TEXT,
        samplingMode TEXT,
        boundsX1 REAL,
        boundsY1 REAL,
        boundsX2 REAL,
        boundsY2 REAL 
    )
`;
                const sqlDropTable = `DROP TABLE IF EXISTS ${table};`;
                const sqlCreateTable = `CREATE TABLE IF NOT EXISTS ${table}
    (
         x INTEGER NOT NULL,
         y INTEGER NOT NULL,
         z INTEGER NOT NULL,
         img blob,
         PRIMARY KEY (x, y, z)
     );`;
                db.executeSet([
                     {statement: sqlDropIndexTable, values: []},
                    {statement: sqlCreateIndexTable, values:[]},
                    {statement: sqlDropTable, values:[]},
                    {statement: sqlCreateTable, values:[]}
                ]).then((result=>{
                    console.log(result);
                    ScreenMessage.info("Table " + tableEntry.name + " was created");
                    const sqlAddEntry = "INSERT OR REPLACE INTO " + tileSetsTableName +
                        " (name, title, description, size, minLevel, maxLevel, boundsX1, boundsY1, boundsX2, boundsY2, dataType, samplingMode) VALUES( ?,?,?,?,?,?, ?,?,?,?,?,? )";
                    const sqlValues = [
                        tableEntry.name, tableEntry.title, tableEntry.description, tableEntry.size,
                        tableEntry.minLevel, tableEntry.maxLevel, ...tableEntry.bounds,
                        tableEntry.dataType, tableEntry.samplingMode
                    ];
                    db.query(sqlAddEntry, sqlValues).then((result)=>{
                        resolve(table);
                    }).catch((err)=>{
                        ScreenMessage.error("Failed to append table " + tableEntry.name + " to available Raster sets.");
                        resolve(null);
                    })
                })).catch((err)=>{
                    ScreenMessage.error("Failed to create table " + tableEntry.name + ".");
                    resolve(null);
                })
            }
        })
    }

    const requestTile = (url: string) => {
        return new Promise<ArrayBuffer>((resolve, reject)=>{
            fetch(url)
                .then(function(response) {
                    if (response.status === 200) {
                        response.arrayBuffer().then((data: ArrayBuffer) => {
                            resolve(data);
                        })
                    } else {
                        reject();
                    }
                }).catch((err=>{
                    reject();
            }))
        })
    }

    const addTileToTable = (table: string, x: number, y: number, z: number) => {
        // @ts-ignore
        const buf2hex = (buffer: ArrayBuffer) =>  [...new Uint8Array(buffer)].map(x => x.toString(16).padStart(2, '0')).join('');

        if (subdomains.length>0) {
            domainIndex.current = (domainIndex.current + 1) % subdomains.length;
        }
      let urlRequest = url;
        urlRequest = urlRequest.replace("{x}", x.toString());
        urlRequest = urlRequest.replace("{-y}", y.toString());
        urlRequest = urlRequest.replace("{y}", y.toString());
        urlRequest = urlRequest.replace("{z}", z.toString());
        urlRequest = urlRequest.replace("{s}", subdomains[domainIndex.current]);
        requestTile(urlRequest).then((data)=>{
            if (databaseManager && databaseManager.getDb()) {
                const db = databaseManager.getDb();
                if (db ) {
                    console.log(urlRequest);
                    const sql = "INSERT OR REPLACE INTO " + table + " (x, y, z, img) VALUES( ?,?,?, X'"+ buf2hex(data) +"')" ;
                    db.query(sql, [x,y,z]).then((result: DBSQLiteValues)=>{
                        console.log(result);
                    }).catch(()=>{
                        // resolve(null);
                    });
                }
            }
        }).catch(()=>{

        })

    }

    const onCancel = (event: any) => {
        history.push("/page/Map")
    }

    const editInput = (event: any) => {
        const {name, value} = event.target;
        const realValue = (typeof event.detail.checked !== "undefined") ? event.detail.checked : value;

        const newInputs = {...inputs};
        // @ts-ignore
        newInputs[name] = realValue;
        setInputs(newInputs);
    }

    const layer = layerId && map ? AdvanceLayerTools.getLayerTreeNodeByID(map, layerId) as any: null;
    const label = layer ? layer.label : "";
    let url = "";
    let subdomains = [] as string[];

    let levelCount = 22;
    let totalTiles = 0;
    let bounds = [] as number[];
    let calculatedZoomLevels = inputs.targetZoomLevels;
    let minMax = [] as number [];
    let dataType = "";
    let samplingMode = "";
    if (layer && layer.model) {
        levelCount = layer.model.levelCount;
        dataType = layer.model.dataType;
        samplingMode = layer.model.samplingMode;

        tileManager.current = new TileManager({p1: {lon:Number(x1),lat:Number(y1)}, p2: {lon:Number(x2),lat:Number(y2)}}, levelCount);
        const result = tileManager.current.getTileRange(5);
        totalTiles = result.totalTiles;
        bounds = result.bounds;
        calculatedZoomLevels = result.maxLevel - result.minLevel;
        minMax = [result.minLevel, result.maxLevel];

        if (layer.restoreCommand && layer.restoreCommand.parameters) {
            if (layer.restoreCommand.parameters.layer.label) {
                const tableName = camelize(layer.restoreCommand.parameters.layer.label);
                if (inputs.tableName !== tableName) setInputs({...inputs, tableName})
            }
            if (layer.restoreCommand.parameters.model.baseURL) {
                url = layer.restoreCommand.parameters.model.baseURL;
                subdomains = layer.restoreCommand.parameters.model.subdomains as string[];
            }
            if (layer.restoreCommand.parameters.model.url) {
                const layername = layer.restoreCommand.parameters.model.layer;
                const format = layer.restoreCommand.parameters.model.format;
                url = layer.restoreCommand.parameters.model.url+`?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetTile&LAYER=${layername}&STYLE=default&FORMAT=${format}&TILEMATRIXSET=GoogleMapsCompatible&TILEMATRIX={z}&TILEROW={-y}&TILECOL={x}`;
            }
        }

    }

    const onSubmit = (event: any) => {
        event.preventDefault();
        event.stopPropagation();

        if (tileManager.current) {
            if (databaseManager && databaseManager.getDb()) {
                const db = databaseManager.getDb();
                const newTableEntry: RaterTableEntry = {
                    name: inputs.tableName, title: inputs.label, description: "", size: totalTiles,
                    minLevel: minMax[0], maxLevel:minMax[1],
                    bounds,
                    dataType,
                    samplingMode
                };
                createTable(db, newTableEntry).then((realTableName)=>{
                    if (realTableName) {
                        let timer = 0

                        tileManager.current?.iterateTilesWithDelay(5, 10,(level: number,x: number,y: number) => {
                            addTileToTable(realTableName, x,y,level);
                            // console.log(`x: ${x} y: ${y} z:${level} `);
                        }, () =>{
                            ScreenMessage.info("Download completed");
                        }, (counter, total) => {
                            const ratio = counter/total * 100;
                            const flag = Math.floor(total / 10);
                            if (counter % flag === 0) {
                                ScreenMessage.info("Percentage:" + ratio.toFixed(2) + "%" )
                            }
                        });
                    }
                });
            } else {
                ScreenMessage.warning("Connect to a database first");
            }
        } else {
            ScreenMessage.warning("No tilemanager created")
        }

        history.push("/page/Map");
    }

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonMenuButton/>
                    </IonButtons>
                    <IonTitle>{pageTitle}</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent fullscreen>
                <IonHeader collapse="condense">
                    <IonToolbar>
                        <IonTitle size="large">{pageTitle}</IonTitle>
                    </IonToolbar>
                </IonHeader>
                {/*-- Content here --*/}
                <form onSubmit={onSubmit}>

                    <IonItem>
                        <IonLabel position="floating">Layer name</IonLabel>
                        <IonInput value={label} readonly/>
                    </IonItem>
                    <IonItem>
                        <IonLabel position="floating">URL:</IonLabel>
                        <IonInput value={url} readonly/>
                    </IonItem>
                    <IonItem>
                        <IonLabel position="floating">Bounds:</IonLabel>
                        <IonInput value={bounds.join(",")} readonly/>
                    </IonItem>

                    <IonItem>
                        <IonLabel position="floating">Levels available at server:</IonLabel>
                        <IonInput value={levelCount} readonly/>
                    </IonItem>
                    <IonItem>
                        <IonLabel position="floating">Requested zoom levels by client:</IonLabel>
                        <IonInput value={inputs.targetZoomLevels} readonly/>
                    </IonItem>
                    {/*  <IonItem>
                        <IonLabel position="floating">Calculated zoom levels:</IonLabel>
                        <IonInput value={calculatedZoomLevels} readonly/>
                    </IonItem> */}
                    <IonItem>
                        <IonLabel position="floating">Tile levels to retrieve:</IonLabel>
                        <IonInput value={`[${minMax.join(", ")}]`} readonly/>
                    </IonItem>
                    <IonItem>
                        <IonLabel position="floating">Subdomains available:</IonLabel>
                        <IonInput value={`[${subdomains.join(", ")}]`} readonly/>
                    </IonItem>
                    <IonItem>
                        <IonLabel position="floating">Estimated Total tiles</IonLabel>
                        <IonInput value={totalTiles + " (approx. " + (totalTiles * 200 / 1024).toFixed(2) + " MBytes)"} readonly/>
                    </IonItem>
                    <IonItem>
                        <IonLabel position="floating">Table name</IonLabel>
                        <IonInput value={inputs.tableName} onIonChange={editInput} name="tableName"/>
                    </IonItem>
                    <IonItem>
                        <IonLabel position="floating">Label</IonLabel>
                        <IonInput value={inputs.label} onIonChange={editInput} name="label"/>
                    </IonItem>

                    <IonItem>
                        <IonLabel position="floating">Datatype</IonLabel>
                        <IonInput value={dataType} readonly/>
                    </IonItem>

                    <IonItem>
                        <IonLabel position="floating">SamplingMode</IonLabel>
                        <IonInput value={samplingMode}  readonly/>
                    </IonItem>
                    <IonRow>
                        <IonCol>
                            <div className="ion-float-end">
                                <IonButtons>
                                    <IonButton type="button" onClick={onCancel}>Cancel</IonButton>
                                    <IonButton type="submit">Submit</IonButton>
                                </IonButtons>
                            </div>
                        </IonCol>
                    </IonRow>
                </form>
            </IonContent>
        </IonPage>
    );
};

function camelize(input: string) {
    const str = input.replace(/[^a-zA-Z ]/g, "");
    return str.replace(/(\w)(\w*)/g,
        function(g0,g1,g2){return g1.toUpperCase() + g2.toLowerCase();}).replace(/\s/g, '');
}

export {
    LayerCapturePage
};
