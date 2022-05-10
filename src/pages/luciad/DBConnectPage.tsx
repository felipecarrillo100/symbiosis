import {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonInput,
    IonItem,
    IonLabel,
    IonMenuButton,
    IonPage,
    IonTitle,
    IonToolbar
} from '@ionic/react';
import '../Page.scss';
import {useState} from "react";
import {CreateCommand} from "../../commands/CreateCommand";
import {ApplicationCommands} from "../../commands/ApplicationCommands";
import {useDispatch, useSelector} from "react-redux";
import {SetAppCommand} from "../../reduxboilerplate/command/actions";
import {useHistory} from "react-router";
import {DataBaseManager} from "../../utils/DataBaseManager";
import {SetDatabaseManager} from "../../reduxboilerplate/database/actions";
import {IAppState} from "../../reduxboilerplate/store";
import {ApplicationCommandsTypes} from "../../commands/ApplicationCommandsTypes";

interface StateProps {
    databaseManager: DataBaseManager | null;
}

const DBConnectPage: React.FC = () => {
    const dispatch = useDispatch();
    const history = useHistory();
    const [ connected, setConnected] = useState(false)

    const [inputs, setInputs] = useState({
        databaseName: "maindb",
    });

    const { databaseManager } = useSelector<IAppState, StateProps>((state: IAppState) => {
        return {
            databaseManager: state.database.databaseManager,
        }
    });

    const pageTitle = "Database manager";

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
    }


    const connect = () => {
        const dataBaseManager1 = new DataBaseManager(inputs.databaseName);
        dataBaseManager1.init().then((dbManager) => {
            if (dbManager) {
                setConnected(true);
                dispatch(SetDatabaseManager(dbManager));
            }
        })
    }

    const disconnect = () => {

        if (databaseManager && databaseManager.getDb()) {
            dispatch(SetDatabaseManager(null));
            setConnected(false);
            databaseManager.destroy().then(() => {
            })
        }

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
                <form className="ion-padding" onSubmit={onSubmit}>
                    <IonItem>
                        <IonLabel position="floating">Database name</IonLabel>
                        <IonInput value={inputs.databaseName} placeholder="Enter a valid url" onIonChange={editInput} name="databaseName" />
                    </IonItem>

                    { !connected ?
                        <IonButton className="ion-margin-top" type="button" expand="block" onClick={connect}>
                            Connect
                        </IonButton> :
                        <IonButton className="ion-margin-top" type="button" expand="block" onClick={disconnect}>
                            Disconnect
                        </IonButton>
                    }

                </form>
            </IonContent>
        </IonPage>
    );
};

export {
    DBConnectPage
};

