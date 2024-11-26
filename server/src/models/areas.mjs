class Area {
    constructor(areaId, areaType, coordinates) {
        this.areaId = areaId;
        this.areaType = areaType;
        this.coordinates = coordinates;
    }
}

class AreaAssociation {
    constructor(areaId, docId) {
        this.areaId = areaId;
        this.docId = docId;
    }
}

export { Area, AreaAssociation };