import * as fs from 'fs';

/**
 * This function is responsible for removing file from the server
 * most especially after file as been sent to client.
 */
export const removeFile = (fileName) => {
  fs.unlink(fileName, (err) => {
    if (err) throw err;
  });
};
