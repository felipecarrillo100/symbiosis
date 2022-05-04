import React, {useEffect, useRef} from "react";
import {Map} from "@luciad/ria/view/Map";
import {WebGLMap} from "@luciad/ria/view/WebGLMap";
import {getReference} from "@luciad/ria/reference/ReferenceProvider";

import "./LuciadMap.scss";
import {MapHandler} from "./layertreetools/MapHandler";
import TreeNodeInterface from "../../interfaces/TreeNodeInterface";
import {ApplicationCommandsTypes} from "../../commands/ApplicationCommandsTypes";
import {MapBuilder} from "./factories/MapBuilder";
import {CreateCommand} from "../../commands/CreateCommand";
import {ApplicationCommands} from "../../commands/ApplicationCommands";
import {LayerTypes} from "./layertypes/LayerTypes";
import {LayerTreeScanner} from "./layertreetools/LayerTreeScanner";
import {LayerConnectCommandsTypes} from "../../commands/ConnectCommands";
import {ScreenMessage} from "../../screenmessage/ScreenMessage";

interface Props {
    id?: string;
    className?: string;
    proj?: string;
    onMapChange?: (newMap:Map | null) => void;
    onLayersChange?: (newMap:TreeNodeInterface | null) => void;
    onSaveMap?: (newMap: { mapState: any; proj: string; layerCommand: LayerConnectCommandsTypes } | null) => void;
    command?: ApplicationCommandsTypes | null;
}

const LuciadMap: React.FC<Props> = (props: React.PropsWithChildren<Props>) => {

    const divEl = useRef(null);
    const proj = useRef("EPSG:4978");
    const map = useRef(null as Map | null);

    useEffect(()=>{
        return () => {
            // On destroy
            console.log("Map destroyed");
            destroyMap();
        }
    }, []);

    useEffect(()=>{
        if (map && props.command) {
            executeCommand(props.command);
        }
    }, [props.command]);

    const executeCommand = (command: ApplicationCommandsTypes | null) => {
        if (map.current && command) {
            switch (command.action ) {
                case ApplicationCommands.CREATELAYER:
                    MapBuilder.executeCommand(command, map.current);
                break;
                case ApplicationCommands.REFRESHLAYERS:
                    startRefresh();
                    break;
                case ApplicationCommands.MAPSAVESTATUS:
                    triggerMapSave();
                    break;
                case ApplicationCommands.MAPRESTORE:
                    restoreMap(command.parameters);
                    break;
                case ApplicationCommands.MAPRESET:
                    resetMap();
                    break;
            }
        }
    }

    function restoreMap(parameters: {layerCommand: LayerConnectCommandsTypes; mapState: any}) {
        if (map.current) {
            map.current.restoreState(parameters.mapState);
            executeCommand(parameters.layerCommand);
        }
    }

    function resetMap() {
        destroyMap();
        createMap();
    }

    const triggerMapSave = () => {
        if (map.current) {
            const layerCommand = LayerTreeScanner.getLayerTreeCommand(map.current.layerTree, {withModels: false});
            const mapState = map.current.saveState();
            const result = {
                layerCommand,
                mapState,
                proj: proj.current
            }
            if (typeof props.onSaveMap === "function") {
                props.onSaveMap(result);
            }
        }
    }

    const startRefresh = () => {
      if (map.current) {
          const mapHandler = (map.current as any).mapHandler as MapHandler;
          mapHandler.triggerRefresh();
      }
    }

    const saveLayers = () => {
        return map.current ? LayerTreeScanner.getLayerTreeCommand(map.current.layerTree, {withModels: true}) : null;
    }

    const restoreLayers = (savedLayers: any) => {
        if (map.current) {
           MapBuilder.executeCommand(savedLayers, map.current);
        }
    }

    useEffect(() => {
        proj.current = props.proj ? props.proj : "EPSG:4978";
        let savedLayers = null;
        let mapState = null;
        if (map.current) {
            savedLayers = saveLayers();
            mapState = map.current.saveState();
            // console.log(savedLayers);
        }
        destroyMap();
        createMap();
        if (map.current ) {
            if (mapState) {
                try {
                    map.current.restoreState(mapState)
                } catch (err) {
                    ScreenMessage.warning("Failed to restore map bounds");
                }
            }
            restoreLayers(savedLayers);
        }
    },[props.proj]);

    const createMap = () => {
        if (divEl.current !== null) {
            const newMap = new WebGLMap(divEl.current, { reference: getReference(proj.current) });
            const mapHandler = new MapHandler(newMap);
            mapHandler.onLayerTreeChange = notifyLayerChange;
            (newMap as any).mapHandler = mapHandler;
            map.current = newMap;
            notifyMapChange();
            mapLayerCreate();
            mapInitialize();
        }
    }

    const notifyMapChange = () => {
        if (typeof props.onMapChange === "function") {
            props.onMapChange(map.current);
        }
    }

    const notifyLayerChange = (node: TreeNodeInterface) => {
        if (typeof props.onLayersChange === "function") {
            props.onLayersChange(node);
        }
    }

    const destroyMap = () => {
        if (map.current !== null) {
            if (map.current.controller) {
                map.current.controller = null;
            }
            map.current.destroy();
            map.current =  null;
            notifyMapChange();
        }
    }

    const mapInitialize = () => {

    }

    const mapLayerCreate = () => {
        if (map.current) {
            const command = CreateCommand({
                action: ApplicationCommands.CREATELAYER,
                parameters: {
                    layerType: LayerTypes.WMSLayer,
                    model: {
                        getMapRoot: "https://sampleservices.luciad.com/wms",
                        version: "1.3.0",
                        referenceText: "EPSG:3857",
                        layers: ["4ceea49c-3e7c-4e2d-973d-c608fb2fb07e"],
                        transparent: false,
                    },
                    layer: {
                        label: "Los angeles",
                        visible: true,
                    },
                    autoZoom: false
                }
            })
           // executeCommand(command);
        }
    }

    const className = "LuciadMap"+ (typeof props.className !== undefined ? " " + props.className : "");

    return <div id={props.id} className={className} ref={divEl}>
        {props.children}
    </div>
}

export {
    LuciadMap
}