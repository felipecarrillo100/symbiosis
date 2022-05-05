import {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonMenuButton,
    IonPage,
    IonTitle,
    IonToolbar
} from '@ionic/react';
import '../Page.scss';
import {CreateCommand} from "../../commands/CreateCommand";
import {ApplicationCommands} from "../../commands/ApplicationCommands";
import {useDispatch} from "react-redux";
import {SetAppCommand} from "../../reduxboilerplate/command/actions";
import {useHistory} from "react-router";
import {ScreenAlert} from "../../screen/ScreenAlert";

const NewFilePage: React.FC = () => {
    const dispatch = useDispatch();
    const history = useHistory();

    const pageTitle = "New workspace";

    const onSubmit = (event: any) => {
        event.preventDefault();
        event.stopPropagation();

        const onOK = (d: any) =>  {
            const command = CreateCommand({
                action: ApplicationCommands.WORKSPACENEW,
            });
            dispatch(SetAppCommand(command));
            history.push('/page/Map');
        }

        ScreenAlert.alert({
            header: "Create workspace",
            message: "All unsaved changes will be lost. Are you sure?",
            buttons:  [
                { text: 'Cancel', handler: () => {} },
                { text: 'Yes', handler: onOK },
            ]
        });
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
                    <IonButton className="ion-margin-top" type="submit" expand="block">
                        Create new workspace
                    </IonButton>
                </form>
            </IonContent>
        </IonPage>
    );
};

export {
    NewFilePage
};

