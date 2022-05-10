import {Capacitor} from "@capacitor/core";
import {CapacitorSQLite, SQLiteConnection, SQLiteDBConnection} from "@capacitor-community/sqlite";

class DataBaseManager {
    private name: string;
    private sqlite: SQLiteConnection | null = null;
    private db: SQLiteDBConnection | null = null;

    constructor(name: string) {
        this.name = name;
    }

    public init() {
        return new Promise<DataBaseManager | null>((resolve) => {
            const dbReady = (db: SQLiteDBConnection) => {
                db.open().then(()=> {
                    this.db  = db;
                    resolve(this);
                }, ()=>{
                    resolve(this);
                })
            }
            const dbFail = (err?: any) => {
                resolve(null);
            }
            const platform = Capacitor.getPlatform();
            if (platform === "web") {
                console.log("Fail: Web not supported")
                dbFail();
                return;
            }
            this.sqlite = new SQLiteConnection(CapacitorSQLite);
            if (this.sqlite === null) {
                console.log("Fail: this.sqlite = new SQLiteConnection(CapacitorSQLite)")
                dbFail();
            } else {
                this.sqlite.checkConnectionsConsistency().then(ret => {
                    this.sqlite?.isConnection(this.name).then((val)=> {
                        const isConn = val.result;
                        if (ret.result && isConn) {
                            this.sqlite?.retrieveConnection(this.name).then( db => {
                                dbReady(db);
                            }, dbFail);
                        } else {
                            this.sqlite?.createConnection(this.name, false, "no-encryption", 1).then( db => {
                                dbReady(db);
                            }, dbFail);
                        }
                    }, dbFail);
                }, (err) => {
                    console.log("Fail: Consistency check", err)
                    dbFail();
                });
            }
        })
    }

    public getDb = () => {
       return this.db;
    }

    public getName = () => {
        return this.name;
    }

    public getSQLite = () => {
        return this.sqlite;
    }

    public listTables() {
        return new Promise<string[]>(((resolve, reject) => {
            if (!this.db) {
                reject();
            } else {
                this.db.getTableList().then((tables)=>{
                    if (tables) resolve(tables.values as string[]); else reject();
                }).catch((err)=>{
                    reject();
                });
            };
        }));
    }

    public destroy() {
        return new Promise((resolve => {
            console.log("Destroying DB");
            this.db?.close().finally(()=>{
                this.sqlite?.closeConnection(this.name).finally(()=> {
                    resolve(true)
                });
            });
        }))
    }
}

export {
    DataBaseManager
}

