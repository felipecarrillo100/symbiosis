import {
    IonButton,
    IonButtons, IonCol,
    IonContent,
    IonHeader,
    IonInput,
    IonItem,
    IonLabel,
    IonMenuButton,
    IonPage, IonRow, IonSelect, IonSelectOption,
    IonTitle,
    IonToolbar
} from '@ionic/react';
import '../../Page.scss';
import {useState} from "react";
import {ApplicationCommands} from "../../../commands/ApplicationCommands";
import {LayerTypes} from "../../../components/luciad/layertypes/LayerTypes";
import {CreateCommand} from "../../../commands/CreateCommand";
import {useDispatch, useSelector} from "react-redux";
import {SetAppCommand} from "../../../reduxboilerplate/command/actions";
import {useHistory} from "react-router";
import {IAppState} from "../../../reduxboilerplate/store";
import {DataBaseManager} from "../../../utils/DataBaseManager";

interface StateProps {
    databaseManager: DataBaseManager | null;
}

const ConnectLocalDatabasePage: React.FC = () => {
    const dispatch = useDispatch();
    const history = useHistory();

    const [inputs, setInputs] = useState({
        label: "Database Raster Layer",
        layer: ""
    });

    const [layers, setLayers] = useState([] as {name: string, size: number}[]);

    const { databaseManager } = useSelector<IAppState, StateProps>((state: IAppState) => {
        return {
            databaseManager: state.database.databaseManager,
        }
    });

    const pageTitle = "Connect to Database table";

    const editInput = (event: any) => {
        const {name, value} = event.target;
        const newInputs = {...inputs};
        // @ts-ignore
        newInputs[name] = value;
        setInputs(newInputs);
    }


    const onSubmit = (event: any) => {
        event.preventDefault();
        event.stopPropagation();


        const command = CreateCommand({
            action: ApplicationCommands.CREATELAYER,
            parameters: {
                layerType: LayerTypes.DatabaseRasterTileset,
                model: {
                    tableName: inputs.layer
                },
                layer: {
                    label: inputs.label,
                    visible: true,
                },
                autoZoom: true
            }
        });
        dispatch(SetAppCommand(command));
        history.push('/page/Map');
    }

    const getLayers = () => {
        if (databaseManager && databaseManager.getDb()) {
            const db = databaseManager.getDb();
            if (db) {
                const tileSetsTableName = "rasters"
                const sql = `SELECT * FROM ${tileSetsTableName}`;
                db.query(sql, []).then(result=>{
                    if (result && result.values && result.values.length>0) {
                       setLayers(result.values);
                       setInputs({...inputs, layer: result.values[0].name})
                    }
                })
            }
        }
    }
    const renderLayers = layers.map((l)=>(
        <IonSelectOption value={l.name} key={l.name}>{l.name}</IonSelectOption>
    ));

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
                <form className="ion-padding" onSubmit={onSubmit}>
                    <IonRow>
                        <IonCol>
                            <div className="ion-float-end">
                                <IonButton type="button" size="small" fill="solid" color="primary" expand="block"
                                           onClick={getLayers}>
                                    Get layers
                                </IonButton>
                            </div>
                        </IonCol>
                    </IonRow>
                    <IonItem>
                        <IonLabel position="floating">Label</IonLabel>
                        <IonInput value={inputs.label} placeholder="Enter name for the layer" onIonChange={editInput} name="label"/>
                    </IonItem>

                    <IonItem>
                        <IonSelect value={inputs.layer} okText="OK" cancelText="Cancel" onIonChange={editInput} name="layer">
                            {renderLayers}
                        </IonSelect>
                    </IonItem>


                    <IonButton className="ion-margin-top" type="submit" expand="block">
                        Add layer
                    </IonButton>
                </form>
            </IonContent>
        </IonPage>
    );
};

export {
    ConnectLocalDatabasePage
};

