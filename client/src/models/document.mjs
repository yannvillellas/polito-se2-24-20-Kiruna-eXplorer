class Document{
    constructor(docId, title, description, stakeholders, scale, issuanceDate, type, connections, language, pages){
        this.docId = docId;
        this.title = title;
        this.description = description;
        this.stakeholders = stakeholders;
        this.scale = scale;
        this.issuanceDate = issuanceDate;
        this.type = type;
        this.connections = connections;
        this.language = language;
        this.pages = pages;}
}

export default Document;