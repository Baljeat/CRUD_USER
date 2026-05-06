const contractTypeRepository = require("../repositories/contractTypeRepository");

exports.getAll = async () => {
    return await contractTypeRepository.getAll();
};

exports.create = async (data) => {
    return await contractTypeRepository.create(data);
};

exports.update = async (maloaihd, data) => {
    return await contractTypeRepository.update(maloaihd, data);
};

exports.delete = async (maloaihd) => {
    return await contractTypeRepository.delete(maloaihd);
};