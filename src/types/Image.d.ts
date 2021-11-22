export default interface Image {
  imgID: string;
  imgContent: Blob;
}

export interface ImageInDB {
  id: string;
  imgID: string;
  imgContent: Blob;
}
