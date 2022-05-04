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
import {useDispatch} from "react-redux";
import {SetAppCommand} from "../../reduxboilerplate/command/actions";
import {useHistory} from "react-router";

const SaveFilePage: React.FC = () => {
    const dispatch = useDispatch();
    const history = useHistory();

    const [inputs, setInputs] = useState({
        filename: "workspace.wsp",
    });

    const pageTitle = "Save workspace";

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
            action: ApplicationCommands.WORKSPACESAVE,
            parameters: {
                filename: inputs.filename
            }
        });
        dispatch(SetAppCommand(command));
        history.push('/page/Map');
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
                        <IonLabel position="floating">Endpoint URL</IonLabel>
                        <IonInput value={inputs.filename} placeholder="Enter a valid url" onIonChange={editInput} name="filename" />
                    </IonItem>

                    <IonButton className="ion-margin-top" type="submit" expand="block">
                        Save workspace
                    </IonButton>
                </form>
            </IonContent>
        </IonPage>
    );
};

export {
    SaveFilePage
};

