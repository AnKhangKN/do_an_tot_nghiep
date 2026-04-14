const mapFields = (row, model) => {
    const result = {};

    for (const key in model.field) {
        const dbField = model.field[key];

        if (row.hasOwnProperty(dbField)) {
            result[key] = row[dbField];
        }
    }

    return result;
};

module.exports = {
    mapFields,
};

/* 
    nếu chỉ có 1 dòng sẽ dùng mapFields(rows, this.userModel); để trả về 1 object
    
    nếu có nhiều dòng sẽ dùng rows.map(row => mapFields(row, this.userModel)) để trả về 1 mảng object
*/