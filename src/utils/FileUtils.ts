class FileUtils {
    public static download(data:string, filename:string, type: string, defaultExtension?:string) {
        if (defaultExtension) {
            const currentExtension = FileUtils.getFilenameExtension(filename);
            if (currentExtension!==defaultExtension) {
                filename = filename + "." + defaultExtension;
            }
        }
        const file = new Blob([data], {type});
        if ((window.navigator as any).msSaveOrOpenBlob) {// IE10+
            (window.navigator as any).msSaveOrOpenBlob(file, filename);
        }
        else { // Others
            const a = document.createElement("a");
            const url = URL.createObjectURL(file);
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            setTimeout(() =>{
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 0);
        }
    }

    public static getFilenameExtension(filename: string) {
        return filename.slice((Math.max(0, filename.lastIndexOf(".")) || Infinity) + 1);
    }

}

export {
    FileUtils
}
