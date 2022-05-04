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


const defaultExtension = ".wsp";

const OpenFilePage: React.FC = () => {
    const dispatch = useDispatch();
    const history = useHistory();

    const [inputs, setInputs] = useState({
        filename: "",
    });

    const [content, setContent] = useState("")

    const pageTitle = "Open Workspace";

    const onSubmit = (event: any) => {
        event.preventDefault();
        event.stopPropagation();
        const workspace = JSON.parse(content);
        console.log(workspace)
        const command = CreateCommand({
            action: ApplicationCommands.WORKSPACERESTORE,
            parameters: workspace
        });
        dispatch(SetAppCommand(command));
        history.push('/page/Map');
    }

    const onFileChange = (fileChangeEvent: any) => {
        const file = fileChangeEvent.target.files[0];
        if (!file) {
            return;
        }
        // Limit file size to 100 Mbytes
        if (file.size < 5 || file.size > 512*1024) {
            return;
        }
        const newInputs = {...inputs};
        newInputs.filename = file.name;
        setInputs(newInputs);

        const reader = new FileReader();
        reader.onload = (event:any) => {
            console.log(event);
            setContent(event.target.result)
        };
        reader.onerror = (ev) => {
            const str = "Error opening file";
            console.log(str);
        }
        reader.readAsText(file);
    };

    const popFileChooser = async () => {
        const element = document.getElementById("file-uploader-id");
        element?.click();
    };

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
                        <IonInput value={inputs.filename} placeholder="Enter a valid url" readonly />
                    </IonItem>

                    <IonButton onClick={popFileChooser}>pop file chooser</IonButton>
                    <input type="file" id="file-uploader-id" hidden onChange={onFileChange} accept={defaultExtension}/>

                    <IonButton className="ion-margin-top" type="submit" expand="block">
                        Open workspace
                    </IonButton>
                </form>
            </IonContent>
        </IonPage>
    );
};

export {
    OpenFilePage
};

