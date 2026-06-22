const mapFields = (row, model) => {
    if (!row) return null;

    const result = {};

    for (const key in model.field) {
        const dbField = model.field[key];

        if (Object.prototype.hasOwnProperty.call(row, dbField)) {
            result[key] = row[dbField];
        }
    }

    return result;
};

module.exports = {
    mapFields,
};

/* 
    Dùng khi get lên client    

    nếu chỉ có 1 dòng sẽ dùng mapFields(rows, this.userModel); để trả về 1 object
    
    nếu có nhiều dòng sẽ dùng rows.map(row => mapFields(row, this.userModel)) để trả về 1 mảng object

    => tác dụng là thay vì trả về field của db trả về theo  field định sẳn của model. VD: full_name => fullName
*/