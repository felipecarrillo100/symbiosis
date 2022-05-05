import {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonInput,
    IonItem,
    IonLabel, IonList,
    IonMenuButton,
    IonPage,
    IonTitle,
    IonToolbar
} from '@ionic/react';
import '../Page.scss';
import {useEffect, useState} from "react";
import {CreateCommand} from "../../commands/CreateCommand";
import {ApplicationCommands} from "../../commands/ApplicationCommands";
import {useDispatch} from "react-redux";
import {SetAppCommand} from "../../reduxboilerplate/command/actions";
import {useHistory} from "react-router";
import {Directory, Filesystem} from "@capacitor/filesystem";
import {IonicFileUtils} from "../../ionictools/IonicFileUtils";
import {TargetDirectories} from "../../ionictools/TargetDirectories";
import {ScreenMessage} from "../../screen/ScreenMessage";


const defaultExtension = ".wsp";

const OpenFileFromFileSysyemPage: React.FC = () => {
    const dispatch = useDispatch();
    const history = useHistory();

    const [inputs, setInputs] = useState({
        filename: "",
        directory: "."
    });

    const [fileList, setFileList] = useState([] as string[]);

    const pageTitle = "Open Workspace";

    useEffect(()=>{
        loadFilesMakeDirs("");
    }, []);

    const loadFilesMakeDirs = (folder: string) => {
        IonicFileUtils.fileExists(TargetDirectories.LocalDirectory).then(exists=> {
            if (!exists) {
                IonicFileUtils.mkdir(TargetDirectories.LocalDirectory).then((success)=>{
                    if (success) {
                        loadDirFiles(folder);
                    }
                })
            } else {
                loadDirFiles(folder);
            }
        })
    }

    const loadDirFiles = (currentDir: string) => {
        Filesystem.readdir({
            path: TargetDirectories.LocalDirectory+"/"+currentDir,
            directory: TargetDirectories.SystemDirectory,
        }).then((result)=> {
            setFileList(result.files);
        });

    }

    const loadFileContent = () => {
        IonicFileUtils.readFile(inputs.filename).then(content=>{
            if (content) {
                const workspace = JSON.parse(content);
                console.log(workspace)
                const command = CreateCommand({
                    action: ApplicationCommands.WORKSPACERESTORE,
                    parameters: workspace
                });
                dispatch(SetAppCommand(command));
                history.push('/page/Map');
            } else {
                ScreenMessage.error("Failed to load file");
            }
        })
    }

    const onSubmit = (event: any) => {
        event.preventDefault();
        event.stopPropagation();
        if (inputs.filename.endsWith("wsp")) {
            loadFileContent();
        }
    }

    const editInput = (event: any) => {
        const {name, value} = event.target;
        const newInputs = {...inputs};
        // @ts-ignore
        newInputs[name] = value;
        setInputs(newInputs);
    }

    const selectFile= (filename: string) => (event:any) => {
        setInputs({...inputs, filename})
    }

    const renderFiles = fileList.map((file, index) => (
        <IonItem key={index}>
            <IonLabel onClick={selectFile(file)}>{file}</IonLabel>
        </IonItem>))

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
                        <IonLabel position="floating">Filename</IonLabel>
                        <IonInput value={inputs.filename} placeholder="Enter filename or wildcard" onChange={editInput} name="filename"/>
                    </IonItem>
                    <IonItem>
                        <IonLabel position="floating">Directory</IonLabel>
                        <IonInput value={inputs.directory} placeholder="Current directory" readonly name="directory"/>
                    </IonItem>
                    <IonList>
                        {renderFiles}
                    </IonList>
                    <IonButton className="ion-margin-top" type="submit" expand="block">
                        Open workspace
                    </IonButton>
                </form>
            </IonContent>
        </IonPage>
    );
};

export {
    OpenFileFromFileSysyemPage
};

