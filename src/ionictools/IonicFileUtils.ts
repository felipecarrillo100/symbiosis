import {Encoding, Filesystem} from "@capacitor/filesystem";
import {TargetDirectories} from "./TargetDirectories";

class IonicFileUtils {

    public static mkdir(folder: string) {
        return new Promise<boolean>((resolve=> {
        Filesystem.mkdir({
            path: folder,
            directory: TargetDirectories.SystemDirectory,
        }).then((result)=>{
            resolve(true)
        }).catch((err)=>{
            resolve(false);
        })
    }))};

    public static fileExists(file: string) {
        return new Promise<boolean>((resolve => {
            Filesystem.stat({
                path: file,
                directory: TargetDirectories.SystemDirectory,
            }).then(result => {
                console.log(result);
                resolve(true);
            }).catch((err)=>{
                console.log(err);
                resolve(false);
            })
        }))
    }

    static writeFile(filenameWithPath: string, text: string) {
        return new Promise<boolean>(resolve=>{
            Filesystem.writeFile({
                path: filenameWithPath,
                data: text,
                directory: TargetDirectories.SystemDirectory,
                encoding: Encoding.UTF8,
            }).then(()=>{
                resolve(true)
            }).catch(()=>{
                resolve(false);
            })
        })
    };

    static readFile(filename: string) {
        return new Promise<string|null>(resolve=>{
            Filesystem.readFile({
                path: TargetDirectories.LocalDirectory + "/" + filename,
                directory: TargetDirectories.SystemDirectory,
                encoding: Encoding.UTF8,
            }).then((result)=>{
                resolve(result.data)
            }).catch(()=>{
                resolve(null);
            })
        })
    };

    static downloadToLocalFolder(content: string, filename: string, type: string) {
        return new Promise<boolean>(resolve => {
            IonicFileUtils.fileExists(TargetDirectories.LocalDirectory).then(exists=>{
                const writeFile = () => {
                    IonicFileUtils.writeFile(TargetDirectories.LocalDirectory +"/"+ filename, content).then((value)=>resolve(value));
                }
                if (exists) {
                    writeFile();
                } else {
                    IonicFileUtils.mkdir(TargetDirectories.LocalDirectory).then((some)=>{
                        writeFile();
                    })
                }
            });
        })
    }
}

export {
    IonicFileUtils
}