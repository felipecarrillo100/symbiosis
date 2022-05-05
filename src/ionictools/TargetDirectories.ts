import {Directory} from "@capacitor/filesystem";

class TargetDirectories {
    public static SystemDirectory = Directory.External;
    public static LocalDirectory = "MyDocuments";
}

export {
    TargetDirectories
}