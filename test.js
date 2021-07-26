const FILE_TYPE_MAP = {
    "image/png": "png",
    "image/jpeg": "jpeg",
    "image/jpg": "jpg"
  };

  const filename_var = "filename"
  const test_obj = {
      [filename_var]: 'aswhinw'
  }

  console.log('yah _>', test_obj[filename_var])
  console.log(FILE_TYPE_MAP["image/jpeg"])

  //if object literal key is in string we can use object[key] to grab value.