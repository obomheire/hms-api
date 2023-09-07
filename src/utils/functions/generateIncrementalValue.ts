// function generateIncrementalValue ( databaseModel ) => {
//     let value = '000000000'
//     const lastValue = await databaseModel.findOne().sort({ createdAt: -1 })
//     if (lastValue) {
//         value = lastValue._id
//     }
//     const newValue = (parseInt(value) + 1).toString()
//     return newValue.padStart(9, '0')

// }

export const  generateIncrementalValue = async (databaseModel: any): Promise<string> => {
  let value = '';

  const lastValue = await databaseModel.findOne().sort({ createdAt: -1 });
  if (lastValue === null) {
    return '000001';
  }
  if (lastValue) {
    value = lastValue.ID.split('-')[1];
  }
  const newValue = (parseInt(value) + 1).toString();
  return newValue.padStart(6, '0');
};

export const generateIncrementalValues = async (databaseModel: any) => {
  let value = '';

  const lastValue = await databaseModel.findOne().sort({ createdAt: -1 });
  if (lastValue === null) {
    return '000001';
  }
  if (lastValue) {
    value = lastValue.staffId.split('-')[1];
  }
  const newValue = (parseInt(value) + 1).toString();
  return newValue.padStart(6, '0');
};
