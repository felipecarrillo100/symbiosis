import {IonApp, IonRouterOutlet, IonSplitPane, setupIonicReact, useIonToast} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Redirect, Route } from 'react-router-dom';
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
import {LayerControlPage} from "./pages/luciad/LayerControlPage";
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

setupIonicReact();


interface StateProps {
  command: ApplicationCommandsTypes | null;
}

const App: React.FC = () => {

  const [present, dismiss] = useIonToast();

  const { command} = useSelector<IAppState, StateProps>((state: IAppState) => {
    return {
      command: state.appCommand.command,
    }
  });

  const displayToast = (parameters: {type: ScreenMessageTypes; message: string}) => {
      present({
        buttons: [{ text: 'hide', handler: () => dismiss() }],
        message: parameters.message,
        duration: 1500
      })
  }

  useEffect(()=>{

    if (command) {
      switch (command.action) {
        case ApplicationCommands.APPTOAST:
          displayToast(command.parameters);
          break;
      }
    }
  }, [command] );

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
              <OpenFilePage />
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
          </IonRouterOutlet>
        </IonSplitPane>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
