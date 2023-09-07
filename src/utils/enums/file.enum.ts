// this enum is used to indicate weather to add or remove from used space
export enum FileStatusEnum {
  Add = 'Add',
  Remove = 'Remove',
}

export enum FileTypeEnum {
  Video = 'Video',
  Audio = 'Audio',
  Document = 'Document',
  Image = 'Image',
}

export enum DocumentTypeEnum {
  WordDocument = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  PDF = 'application/pdf',
}
