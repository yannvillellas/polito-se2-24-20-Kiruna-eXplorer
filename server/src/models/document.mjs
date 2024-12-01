class Document{
    constructor(docId, title, description, stackeholders, scale, ASvalue, issuanceDate, type, connections, language, pages){
        this.docId = docId;
        this.title = title;
        this.description = description;
        this.stackeholders = stackeholders;
        this.scale = scale;
        this.ASvalue=ASvalue
        this.issuanceDate = issuanceDate;
        this.type = type;
        this.connections = connections;
        this.language = language;
        this.pages = pages;}
}

export default Document;