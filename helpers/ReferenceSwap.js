let referenceSwap = async (obj, key, _id, model) => {
  let swap = false;
  try {
    let _idString = _id.toString();
    for (let i = 0; i < obj[key].length; i++) {
      if (obj[key].toString() === _idString) {
        swap = true;
        break;
      }
    }
    if (!swap) {
      let updatedObjKey = obj[key].filter((id) => id.toString() !== _idString);
      obj[key] = updatedObjKey;
      await obj.save();
      const newObj = await model.findById(_idString);
      newObj[key].push(_id);
      await newObj.save();
    }
  } catch (err) {
    throw new Error(err);
  }
};

module.exports = { referenceSwap };
