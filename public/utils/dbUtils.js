    const BUILDING = "栋";
    const UNIT = "单元";
    const FLOOR = "楼";
    const NUMBER = "号";
    const POSITION = "洞";
    const CM = "mm";
    const PLUS = "*";


exports.createProductId = function (projectName, data) {
    var productId = projectName;
    if (data.building != null) {
        productId += data.building + BUILDING;
    }

    if (data.unit != null) {
        productId += data.unit + UNIT;
    }

    if (data.floor != null) {
        productId += data.floor + FLOOR;
    }

    if (data.number != null) {
        productId += data.number + NUMBER;
    }

    if (data.position != null) {
        productId += data.position + POSITION;
    }

    productId += data.type;
    productId += data.width + CM;
    productId += PLUS + data.height + CM;

    return productId;
}


