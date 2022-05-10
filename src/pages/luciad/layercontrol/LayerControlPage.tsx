import {
    IonAvatar,
    IonButton,
    IonButtons,
    IonCol,
    IonContent,
    IonHeader,
    IonIcon,
    IonInput,
    IonItem,
    IonItemOption,
    IonItemOptions,
    IonItemSliding,
    IonLabel,
    IonList,
    IonMenuButton,
    IonPage,
    IonReorder,
    IonReorderGroup,
    IonRow,
    IonTitle,
    IonToggle,
    IonToolbar
} from '@ionic/react';
import '../../Page.scss';
import {useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {IAppState} from "../../../reduxboilerplate/store";
import TreeNodeInterface from "../../../interfaces/TreeNodeInterface";
import {Map} from "@luciad/ria/view/Map";
import {settingsOutline, settingsSharp, trashOutline, trashSharp} from "ionicons/icons";
import {AdvanceLayerTools} from "../../../components/luciad/layerutils/AdvanceLayerTools";
import {useHistory} from "react-router";
import {Layer} from "@luciad/ria/view/Layer";
import {CreateCommand} from "../../../commands/CreateCommand";
import {ApplicationCommands} from "../../../commands/ApplicationCommands";
import {SetAppCommand} from "../../../reduxboilerplate/command/actions";
import {MapHandler} from "../../../components/luciad/layertreetools/MapHandler";
import {LayerControlLabelProvider} from "./LayerControlLabelProvider";

interface StateProps {
    treeNode: TreeNodeInterface | null;
    currentLayerId: string | null;
    map: Map | null;
}


const LayerControlPage: React.FC = () => {
    const history = useHistory();
    const dispatch = useDispatch();

    const [canMove, setCanMove] = useState(false);
    const [inputs, setInputs] = useState({
        label: "",
    });
    const [settings, setSettings] = useState({
        open: false,
        target: null as TreeNodeInterface | null,
        realNode: null as Layer | null
    })


    const { treeNode, map , currentLayerId} = useSelector<IAppState, StateProps>((state: IAppState) => {
        return {
            treeNode: state.luciadMap.treeNode,
            map: state.luciadMap.map,
            currentLayerId: state.luciadMap.currentLayerId
        }
    });

    const editInput = (event: any) => {
        const {name, value} = event.target;
        const newInputs = {...inputs};
        // @ts-ignore
        newInputs[name] = value;
        setInputs(newInputs);
    }

    const pageTitle = "Layer Manager";

    const onReorder = (event: CustomEvent) => {
        const moveInMap = (b: string[], id: string) => {
            b.reverse();
            if (map) {
                const index = b.findIndex((ele:string)=>ele === id);
                if (index > -1) {
                    const node = map.layerTree.findLayerById(b[index]);
                    if (index>0) {
                        const nodePrevious = map.layerTree.findLayerById(b[index-1]);
                        map.layerTree.moveChild(node, "above", nodePrevious);
                    } else {
                        map.layerTree.moveChild(node, "bottom");
                    }
                }
            }
        }
        if (treeNode) {
            const a = treeNode.nodes.map(node=>node.id.toString()).reverse();
            const b = event.detail.complete([...a]);
            const change = whichElementMoved(a, b);
            if (change.id) {
               if (change.forward) {
                   moveInMap(b, change.id);
               } else {
                   moveInMap(b, change.id);
               }
            }
        }
    };

    const toggleVisibility = (nodeElement: TreeNodeInterface) => (event: any) => {
        if (nodeElement && nodeElement.id && map) {
            const node = map.layerTree.findLayerById(nodeElement.id);
            if (node) {
               node.visible = !node.visible;
            }
        }
    }

    const setAsCurrentLayer = (nodeElement: TreeNodeInterface) => (event: any) => {
        if (nodeElement && nodeElement.id && map) {
            const mapHandler = (map as any).mapHandler as MapHandler;
            if (mapHandler) {
               mapHandler.setCurrentLayer(nodeElement.id);
            }
        }
    }

    const deleteNode = (nodeElement: TreeNodeInterface) => (event: any) => {
        if (nodeElement && nodeElement.id && map) {
            const node = map.layerTree.findLayerById(nodeElement.id);
            if (node) {
                map.layerTree.removeChild(node);
            }
        }
    }

    const changeSettings = (nodeElement: TreeNodeInterface) => (event: any) => {
        if (nodeElement && nodeElement.id && map) {
            const node = map.layerTree.findLayerById(nodeElement.id);
            if (node) {
                setInputs({label: node.label})
                setSettings({
                    open: true,
                    target: nodeElement,
                    realNode: node,
                })

            }
        }
    }

    const fitToBounds = (nodeElement: TreeNodeInterface) => (event: any) => {
        if (nodeElement && nodeElement.id && map) {
            const node = map.layerTree.findLayerById(nodeElement.id);
            if (node) {
                AdvanceLayerTools.fitToLayer(map, node);
                history.push('/page/Map');
            }
        }
    }

    const ChangeSettingsRender = () => {
        const onSubmit = (event: any) => {
            event.preventDefault();
            event.stopPropagation();
            if (settings.realNode) {
                settings.realNode.label = inputs.label;
                const command = CreateCommand({
                    action: ApplicationCommands.REFRESHLAYERS
                });
                dispatch(SetAppCommand(command));
            }
            setSettings({
                open: false,
                target: null,
                realNode: null,
            });
        }
        const onCancel = (event: any) => {
            setSettings({
                open: false,
                target: null,
                realNode: null,
            });
        }
        return (
            <form onSubmit={onSubmit} className="ion-padding">
                <IonItem>
                    <IonLabel position="floating">Label</IonLabel>
                    <IonInput value={inputs.label} placeholder="Enter name for the layer" onIonChange={editInput} name="label"/>
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
        )
    }


    const layers = treeNode && map ? treeNode.nodes.map((node) => {
        const isSelected = node.id ===currentLayerId;
        return (
        <IonItemSliding key={node.id} >
            <IonItemOptions side="start">
                <IonItemOption onClick={changeSettings(node)}>
                    <IonIcon slot="start" ios={settingsOutline} md={settingsSharp} />
                </IonItemOption>
            </IonItemOptions>
                <IonItem color={isSelected ? "medium": undefined}>
                    <LayerControlLabelProvider node={node} onZoomClick={fitToBounds(node)} onClick={setAsCurrentLayer(node)}/>
                    {
                        canMove ?
                        <IonReorder slot="end"/> :
                        <IonToggle slot="end" checked={node.visible.value} onIonChange={toggleVisibility(node)}></IonToggle>
                    }
                </IonItem>
            <IonItemOptions side="end">
                <IonItemOption onClick={deleteNode(node)}>
                    <IonIcon slot="start" ios={trashOutline} md={trashSharp} />
                </IonItemOption>
            </IonItemOptions>
        </IonItemSliding>
        )}).reverse() :
        <IonList>
            <IonItem>
                <IonAvatar slot="start" >
                    <img src={"/assets/avatars/warning.png"} style={{borderRadius:0}} alt="Warning" />
                </IonAvatar>
                <IonLabel>
                    <h2>The map is currently empty</h2>
                    <p>Use the Connect menu to add layers</p>
                </IonLabel>
                <IonLabel>
                </IonLabel>
            </IonItem></IonList>;

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonMenuButton/>
                    </IonButtons>
                    <IonTitle>{pageTitle}</IonTitle>
                    <IonButtons slot="primary">
                        <IonButton onClick={() => setCanMove(!canMove)}>{canMove ? "Fix" : "Move"}</IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>

            <IonContent fullscreen>
                <IonHeader collapse="condense">
                    <IonToolbar>
                        <IonTitle size="large">{pageTitle}</IonTitle>
                    </IonToolbar>
                </IonHeader>
                {/*-- List of Text Items --*/}
                { settings.open === true ?
                    <div>
                        {ChangeSettingsRender()}
                    </div> :
                    <IonReorderGroup disabled={!canMove} onIonItemReorder={onReorder}>
                        {layers}
                    </IonReorderGroup>
                }

            </IonContent>
        </IonPage>
    );
};

function whichElementMoved(a: string[], b: string[]) {
    for (let i=0; i < a.length; i++) {
        if (a[i] !== b[i]) {
            if(a[i+1] === b[i]) {
                return {
                    id: a[i],
                    forward: true
                }
            } else {
                return {
                    id: b[i],
                    forward: false
                }
            }
        }
    }
    return {
        id: null,
        direction: "forward"
    }
}

export {
    LayerControlPage
};
