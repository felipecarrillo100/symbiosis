import {MemoryStore} from "@luciad/ria/model/store/MemoryStore";
import {Feature} from "@luciad/ria/model/feature/Feature";
import {createPoint} from "@luciad/ria/shape/ShapeFactory";
import {getReference} from "@luciad/ria/reference/ReferenceProvider";

interface FeatureFileStoreOptions {
    filename: string;
    filePath: string;
    create?: boolean;
}


class FeatureFileStore extends MemoryStore {
    private filename: string;
    private filePath: string;
    private create: boolean | undefined;

    constructor(options: FeatureFileStoreOptions) {
        super();
        this.filename = options.filename;
        this.filePath = options.filePath;
        this.create = options.create;



        if (!this.create) {
            this.loadFromDisk();
        }
    }

    private loadFromDisk() {
        const properties = {name: "Mexico", country: "Mexico"};
        const point = createPoint(getReference("CRS:84"),[0,0]);
        const feature = new Feature(point, properties, 1);
        this.put(feature);
    }


}

export {
    FeatureFileStore
}