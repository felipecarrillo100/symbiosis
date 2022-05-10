import {
    IonAccordion,
    IonAccordionGroup,
    IonButton,
    IonButtons,
    IonContent,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonListHeader,
    IonMenu,
    IonMenuToggle,
    IonNote,
} from '@ionic/react';

import {useLocation} from 'react-router-dom';
import {
    analyticsOutline, analyticsSharp,
    cubeOutline, cubeSharp,
    documentOutline, documentSharp,
    fileTrayOutline, fileTraySharp,
    gitNetworkOutline,
    gitNetworkSharp,
    globeOutline,
    globeSharp, imageOutline, imageSharp, layersOutline, layersSharp,
    mapOutline,
    mapSharp, openOutline, openSharp, saveOutline, saveSharp,
} from 'ionicons/icons';
import './Menu.scss';
import {useDispatch, useSelector} from "react-redux";
import {IAppState} from "../reduxboilerplate/store";
import {AnyAction, Dispatch} from "redux";
import {SetLuciadMapProj} from "../reduxboilerplate/luciadmap/actions";


interface AppPageButton {
    title: string | ((values?: AppPage | AppSubMenu, parameters?: any) => string);
    action: (dispatch: Dispatch<AnyAction>, values?: AppPage | AppSubMenu, parameters?: any) => void;
}

interface AppPage {
    url: string;
    iosIcon: string;
    mdIcon: string;
    title: string;
    buttons?: AppPageButton[]
}

interface AppSubMenu {
    subtitle: string;
    pages: AppPage[];
    iosIcon: string;
    mdIcon: string;
}


const MapItems: AppPage[] = [
    {
        title: 'Layers',
        url: '/page/Layers',
        iosIcon: layersOutline,
        mdIcon: layersSharp,
    },
    {
        title: 'Map',
        url: '/page/Map',
        iosIcon: globeOutline,
        mdIcon: globeSharp,
        buttons: [
            {
                title: (values, options) => {
                    return options.proj === "EPSG:4978" ? "2D" : "3D"
                },
                action: (dispatch, values, options) => {
                    const newProj = options.proj === "EPSG:4978" ? "EPSG:3857" : "EPSG:4978";
                    setTimeout(() => {
                        dispatch(SetLuciadMapProj(newProj))
                    }, 100)
                }
            },
        ]
    },
]

const ConnectSubmenu: AppSubMenu = {
    subtitle: "Connect",
    iosIcon: gitNetworkOutline,
    mdIcon: gitNetworkSharp,
    pages: [
        {
            title: 'WMS',
            url: '/page/connect/WMS',
            iosIcon: imageOutline,
            mdIcon: imageSharp
        },
        {
            title: 'WMTS',
            url: '/page/connect/WMTS',
            iosIcon: imageOutline,
            mdIcon: imageSharp
        },
        {
            title: 'LTS',
            url: '/page/connect/LTS',
            iosIcon: imageOutline,
            mdIcon: imageSharp
        },
        {
            title: 'WFS',
            url: '/page/connect/WFS',
            iosIcon: analyticsOutline,
            mdIcon: analyticsSharp
        },
        {
            title: 'TMS',
            url: '/page/connect/TMS',
            iosIcon: imageOutline,
            mdIcon: imageSharp
        },
        {
            title: 'Bingmaps',
            url: '/page/connect/Bingmaps',
            iosIcon: imageOutline,
            mdIcon: imageSharp
        },
        {
            title: 'OGC 3D Tiles',
            url: '/page/connect/OGC3DTiles',
            iosIcon: cubeOutline,
            mdIcon: cubeSharp
        },
        {
            title: 'JSON File',
            url: '/page/connect/FileJson',
            iosIcon: analyticsOutline,
            mdIcon: analyticsSharp
        },
        {
            title: 'Database tileset',
            url: '/page/connect/Database',
            iosIcon: imageOutline,
            mdIcon: imageSharp
        },
    ]
}


const MapRestoreItems: AppPage[] = [
    {
        title: 'Save workspace',
        url: '/page/FileSave',
        iosIcon: saveOutline,
        mdIcon: saveSharp,
    },
    {
        title: 'Open workspace',
        url: '/page/FileOpen',
        iosIcon: openOutline,
        mdIcon: openSharp,
    },
    {
        title: 'New workspace',
        url: '/page/New',
        iosIcon: documentOutline,
        mdIcon: documentSharp,
    },
    {
        title: 'Database',
        url: '/page/database/connect',
        iosIcon: documentOutline,
        mdIcon: documentSharp,
    },
]

const FileSubmenu: AppSubMenu = {
    subtitle: "Workspace",
    iosIcon: fileTrayOutline,
    mdIcon: fileTraySharp,
    pages: MapRestoreItems
}

const appMenu = [
    ...MapItems, ...[ConnectSubmenu], ...[FileSubmenu]
];

interface StateProps {
    proj: string;
}

const Menu: React.FC = () => {
    const location = useLocation();
    const dispatch = useDispatch();


    const {proj} = useSelector<IAppState, StateProps>((state: IAppState) => {
        return {
            proj: state.luciadMap.proj,
        }
    });

    return (
        <IonMenu contentId="main" type="overlay">
            <IonContent>
                <IonList className="inbox-list-class">
                    <IonListHeader>Project Symbiosis</IonListHeader>
                    <IonNote>felipe.carrillo.romero@hexagon.com</IonNote>

                    {appMenu.map((menuItemAny: any, index) => {
                        if (typeof menuItemAny.title !== "undefined") {
                            const menuItem = menuItemAny as AppPage
                            return (
                                <IonMenuToggle key={index} autoHide={false}>
                                    <IonItem className={location.pathname === menuItem.url ? 'selected' : ''}
                                             routerLink={menuItem.url} routerDirection="none" lines="none"
                                             detail={false}>
                                        <IonIcon slot="start" ios={menuItem.iosIcon} md={menuItem.mdIcon}/>
                                        <IonLabel>{menuItem.title}</IonLabel>
                                        {menuItem.buttons &&
                                        <IonButtons>
                                            {menuItem.buttons.map((button: any, index) => (
                                                <IonButton onClick={() => button.action(dispatch, menuItem, {proj})}
                                                           key={index}>
                                                    {typeof button.title === "function" ? button.title(menuItem, {proj}) : button.title}
                                                </IonButton>
                                            ))}
                                        </IonButtons>
                                        }
                                    </IonItem>
                                </IonMenuToggle>
                            );
                        }
                        if (typeof menuItemAny.subtitle !== "undefined") {
                            const subMenuItem = menuItemAny as AppSubMenu
                            return (
                                <IonAccordionGroup animated={true} key={index}>
                                    <IonAccordion>
                                        <IonItem slot="header">
                                            <IonIcon slot="start" ios={subMenuItem.iosIcon} md={subMenuItem.mdIcon}/>
                                            <IonLabel>{subMenuItem.subtitle}</IonLabel>
                                        </IonItem>
                                        <IonList slot="content" id="submenu-list" className="submenu-list">
                                            {subMenuItem.pages.map((appPage, index) => {
                                                return (
                                                    <IonMenuToggle key={index} autoHide={false}>
                                                        <IonItem
                                                            className={location.pathname === appPage.url ? 'selected' : ''}
                                                            routerLink={appPage.url} routerDirection="none" lines="none"
                                                            detail={false}>
                                                            <IonIcon slot="start" ios={appPage.iosIcon}
                                                                     md={appPage.mdIcon}/>
                                                            <IonLabel>{appPage.title}</IonLabel>
                                                        </IonItem>
                                                    </IonMenuToggle>
                                                );
                                            })}
                                        </IonList>
                                    </IonAccordion>
                                </IonAccordionGroup>
                            );
                        }
                    })}
                </IonList>

                { /*
        <IonList id="labels-list">
          <IonListHeader>Labels</IonListHeader>
          {labels.map((label, index) => (
            <IonItem lines="none" key={index}>
              <IonIcon slot="start" icon={bookmarkOutline} />
              <IonLabel>{label}</IonLabel>
            </IonItem>
          ))}
        </IonList> */}
            </IonContent>
        </IonMenu>
    );
};

export default Menu;
