import {IonApp, IonRouterOutlet, IonSplitPane, setupIonicReact, useIonAlert, useIonToast} from '@ionic/react';
import {IonReactRouter} from '@ionic/react-router';
import {Redirect, Route} from 'react-router-dom';
import Menu from './components/Menu';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import {LuciadMapPage} from "./pages/luciad/LuciadMapPage";
import {ConnectWMSPage} from "./pages/luciad/connect/ConnectWMSPage";
import {ConnectWFSPage} from "./pages/luciad/connect/ConnectWFSPage";
import {ConnectTMSPage} from "./pages/luciad/connect/ConnectTMSPage";
import {LayerControlPage} from "./pages/luciad/layercontrol/LayerControlPage";
import {ApplicationCommandsTypes} from "./commands/ApplicationCommandsTypes";
import {ConnectBingMapsPage} from "./pages/luciad/connect/ConnectBingMapsPage";
import {OpenFilePage} from "./pages/luciad/OpenFilePage";
import {ConnectWMTSPage} from "./pages/luciad/connect/ConnectWMTSPage";
import {ConnectLTSPage} from "./pages/luciad/connect/ConnectLTSPage";
import {ConnectOGC3DTilesPage} from "./pages/luciad/connect/ConnectOGC3DTilesPage";
import {NewFilePage} from "./pages/luciad/NewFilePage";
import {SaveFilePage} from "./pages/luciad/SaveFilePage";
import {useSelector} from "react-redux";
import {IAppState} from "./reduxboilerplate/store";
import {useEffect} from "react";
import {ApplicationCommands} from "./commands/ApplicationCommands";
import {ScreenMessageTypes} from "./interfaces/ScreenMessageTypes";
import {AlertButton} from "@ionic/core/components";
import {ConnectLocalFilePage} from "./pages/luciad/connect/ConnectLocalFilePage";
import {OpenFileFromFileSysyemPage} from "./pages/luciad/OpenFileFromFileSysyemPage";
import {Capacitor} from "@capacitor/core";
import {ConnectLocalDatabasePage} from "./pages/luciad/connect/ConnectLocalDatabasePage";
import {LayerCapturePage} from "./pages/luciad/layercontrol/LayerCapturePage";
import {DBConnectPage} from "./pages/luciad/DBConnectPage";

setupIonicReact();


interface StateProps {
  command: ApplicationCommandsTypes | null;
}

const App: React.FC = () => {

  const [presentToast, dismissToast] = useIonToast();
  const [presentAlert] = useIonAlert();


  const { command} = useSelector<IAppState, StateProps>((state: IAppState) => {
    return {
      command: state.appCommand.command,
    }
  });

  const displayToast = (parameters: {type: ScreenMessageTypes; message: string}) => {
      presentToast({
        buttons: [{ text: 'hide', handler: () => dismissToast() }],
        message: parameters.message,
        duration: 1500
      })
  }

  const displayAlert = (parameter: { header: string; message: string; buttons?: AlertButton[]  }) => {
    presentAlert({
      cssClass: 'my-css',
      header: parameter.header,
      message: parameter.message,
      buttons: parameter.buttons,
      onDidDismiss: (e) => {
        // console.log('Has dismissed')
      }
    });
  }

  useEffect(()=>{


    if (command) {
      switch (command.action) {
        case ApplicationCommands.APPTOAST:
          displayToast(command.parameters);
          break;
        case ApplicationCommands.APPALERT:
          displayAlert(command.parameters)
          break;
      }
    }
  }, [command] );

  const platform = Capacitor.getPlatform();

  return (
    <IonApp>
      <IonReactRouter>
        <IonSplitPane contentId="main">
          <Menu />
          <IonRouterOutlet id="main" >
            <Route path="/" exact={true}>
              <Redirect to="/page/Map" />
            </Route>
            <Route path="/page/Map" exact={true}>
              <LuciadMapPage />
            </Route>
            <Route path="/page/Layers" exact={true}>
              <LayerControlPage />
            </Route>
            <Route path="/page/connect/WMS" exact={true}>
              <ConnectWMSPage />
            </Route>
            <Route path="/page/connect/WMTS" exact={true}>
              <ConnectWMTSPage />
            </Route>
            <Route path="/page/connect/LTS" exact={true}>
              <ConnectLTSPage />
            </Route>
            <Route path="/page/connect/WFS" exact={true}>
              <ConnectWFSPage />
            </Route>
            <Route path="/page/connect/TMS" exact={true}>
              <ConnectTMSPage />
            </Route>
            <Route path="/page/connect/Bingmaps" exact={true}>
              <ConnectBingMapsPage />
            </Route>
            <Route path="/page/FileOpen" exact={true}>
              {platform === "web" ?
                  <OpenFilePage /> :
                  <OpenFileFromFileSysyemPage />
              }
            </Route>
            <Route path="/page/FileSave" exact={true}>
              <SaveFilePage />
            </Route>
            <Route path="/page/New" exact={true}>
              <NewFilePage />
            </Route>
            <Route path="/page/connect/OGC3DTiles" exact={true}>
              <ConnectOGC3DTilesPage />
            </Route>
            <Route path="/page/connect/FileJson" exact={true}>
              <ConnectLocalFilePage />
            </Route>
            <Route path="/page/connect/Database" exact={true}>
              <ConnectLocalDatabasePage />
            </Route>
            <Route path="/page/captureLayer/:layerId/:x1/:y1/:x2/:y2" exact={true}>
              <LayerCapturePage />
            </Route>
            <Route path="/page/database/connect" exact={true}>
              <DBConnectPage />
            </Route>
          </IonRouterOutlet>
        </IonSplitPane>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
