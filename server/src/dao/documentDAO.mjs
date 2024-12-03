import {db} from "../database/db.mjs"
import Document from "../models/document.mjs"

export const listDocuments = () => {
    return new Promise((resolve, reject) => {
        const sql=`SELECT docId, title, description, s.name as scale, ASvalue, issuanceDate, dt.type as type, connections, language, pages
                FROM Document d, Scale s, DocumentType dt
                WHERE d.scale=s.scaleId AND d.type=dt.dtId;`
        //with this query replace the id of scale and type with the names, missing stakeholders that are a list to manage in the next query
        db.all(sql,[], (err, drows) => {
            if (err) {
                console.log("primo errore ", err)
                reject(err);
            } else {
                if(drows){
                    //join docId with stakeholders name
                    db.all("SELECT ds.docId, s.name from Stakeholder s, DocStakeholders ds WHERE s.shId=ds.shId",[],(err,srows)=>{
                        if(err){
                            console.log("secondo errore")
                            reject(err)
                        }else{
                            //mapping stakeholders from id list to names list for the document visualization
                            console.log(drows)
                            console.log(srows)
                            const documents = drows.map(row => new Document(row.docId,
                                                                        row.title, 
                                                                        row.description, 
                                                                        srows.filter(s=>s.docId==row.docId).map(s=>s.name).join(', '),//stakeholders
                                                                        row.scale, 
                                                                        row.ASvalue,
                                                                        row.issuanceDate, 
                                                                        row.type, 
                                                                        row.connections, 
                                                                        row.language, 
                                                                        row.pages));
                            console.log(documents)
                            resolve(documents);
                        }
                    })
                }else{
                    resolve([]);
                }
            }
        });
    });
}



export const addDocument = (document) => {
    return new Promise((resolve, reject) => {
        db.run("INSERT INTO Document (title, description, scale,ASvalue, issuanceDate, type, connections, language, pages) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", 
            [
                document.title, 
                document.description, 
                document.scale, 
                document.ASvalue,
                document.issuanceDate, 
                document.type, 
                document.connections, 
                document.language, 
                document.pages
            ],

            function (err) { // I need it for enable this.lastID
                    if (err) {
                        reject(err);
                    } else {
                        const docId=this.lastID
                        console.log(document)
                        console.log(document.stakeholders.split(', '))
                        document.stakeholders.split(', ').forEach(shId => {
                            console.log(shId)
                            console.log(docId)
                            db.run("INSERT INTO DocStakeholders (docId, shId) VALUES (?,?)",[parseInt(docId,10),parseInt(shId,10)],(err,rows)=>{
                                if(err){
                                    reject(err)
                                }else{
                                    resolve(docId)
                                }
                            })
                        });
                        //resolve(this.lastID);
                    }
            }
        );
    });
};

export const deleteDocument = (docId) =>{
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM Document WHERE docId=?'
        db.run(sql,[docId],(err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        })
    })
}

