# Project Symbiosis

## Description
Project Symbiosis integrates LuciadRIA 2021.1 to IONIC Capacitor environment

The Map supports 2D/3D maps seamless toggle and adding layers from many sources (WMS,WFS,WMTS, LTS, 3D Tiles, etc)

* Layer control
* Workspace
* Redux boilerplate integrated


## To build for android
Use IONIC environment to build
```
npm install @capacitor/android
npx cap add android
ionic build

ionic capacitor sync android
npx cap open android
```

## To test

Run in browser

```
ionic serve
``` 
Run in Android live reload

```
ionic cap run android -l --external
```



## Requirements.
* LuciadRIA 2021.1 or higher  